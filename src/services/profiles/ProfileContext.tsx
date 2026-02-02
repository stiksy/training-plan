import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
// import { useAuth } from '../auth/AuthContext'
import { useMockAuth as useAuth } from '../auth/MockAuth'
import { supabase } from '../supabase'
import type { User, Household } from '@/types'

interface ProfileContextType {
  activeProfile: User | null
  setActiveProfile: (user: User | null) => void
  householdMembers: User[]
  household: Household | null
  loading: boolean
  refreshProfiles: () => Promise<void>
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined)

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user: authUser } = useAuth()
  const [activeProfile, setActiveProfile] = useState<User | null>(null)
  const [householdMembers, setHouseholdMembers] = useState<User[]>([])
  const [household, setHousehold] = useState<Household | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshProfiles = async () => {
    if (!authUser) {
      setHouseholdMembers([])
      setHousehold(null)
      setActiveProfile(null)
      setLoading(false)
      return
    }

    try {
      // Get user's household
      const { data: membershipData, error: membershipError } = await supabase
        .from('household_members')
        .select('household_id')
        .eq('user_id', authUser.id)
        .single()

      if (membershipError || !membershipData) {
        console.error('Error fetching household membership:', membershipError)
        setLoading(false)
        return
      }

      // Get household details
      const { data: householdData, error: householdError } = await supabase
        .from('households')
        .select('*')
        .eq('id', membershipData.household_id)
        .single()

      if (householdError) {
        console.error('Error fetching household:', householdError)
        setLoading(false)
        return
      }

      setHousehold(householdData)

      // Get all household member user IDs
      const { data: membershipRecords, error: membersError } = await supabase
        .from('household_members')
        .select('user_id')
        .eq('household_id', membershipData.household_id)

      if (membersError || !membershipRecords) {
        console.error('Error fetching household members:', membersError)
        setLoading(false)
        return
      }

      // Get user details for all members
      const userIds = membershipRecords.map(m => m.user_id)
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .in('id', userIds)

      if (usersError || !usersData) {
        console.error('Error fetching users:', usersError)
        setLoading(false)
        return
      }

      setHouseholdMembers(usersData)

      // Set active profile to current auth user if not already set
      if (!activeProfile && usersData.length > 0) {
        const currentUser = usersData.find(m => m.id === authUser.id)
        if (currentUser) {
          setActiveProfile(currentUser)
        } else {
          // Default to first member if auth user not found
          setActiveProfile(usersData[0])
        }
      }
    } catch (error) {
      console.error('Error loading profiles:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshProfiles()
  }, [authUser])

  // Save active profile to localStorage
  useEffect(() => {
    if (activeProfile) {
      localStorage.setItem('activeProfileId', activeProfile.id)
    }
  }, [activeProfile])

  // Restore active profile from localStorage on mount
  useEffect(() => {
    const savedProfileId = localStorage.getItem('activeProfileId')
    if (savedProfileId && householdMembers.length > 0) {
      const savedProfile = householdMembers.find(m => m.id === savedProfileId)
      if (savedProfile && (!activeProfile || activeProfile.id !== savedProfileId)) {
        setActiveProfile(savedProfile)
      }
    }
  }, [householdMembers])

  const value = {
    activeProfile,
    setActiveProfile,
    householdMembers,
    household,
    loading,
    refreshProfiles
  }

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
}

export function useProfile() {
  const context = useContext(ProfileContext)
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider')
  }
  return context
}
