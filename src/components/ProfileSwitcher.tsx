import { useProfile } from '@/services/profiles/ProfileContext'
import './ProfileSwitcher.css'

export function ProfileSwitcher() {
  const { activeProfile, householdMembers, setActiveProfile } = useProfile()

  if (householdMembers.length === 0) {
    return null
  }

  return (
    <div className="profile-switcher">
      <div className="profile-switcher-header">
        <h2>Who's using the app?</h2>
        <p>Select your profile</p>
      </div>
      <div className="profile-grid">
        {householdMembers.map((member) => (
          <button
            key={member.id}
            className={`profile-card ${activeProfile?.id === member.id ? 'active' : ''}`}
            onClick={() => setActiveProfile(member)}
          >
            <div className="profile-avatar">
              {member.name.charAt(0).toUpperCase()}
            </div>
            <div className="profile-name">{member.name}</div>
            {activeProfile?.id === member.id && (
              <div className="profile-active-badge">Active</div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
