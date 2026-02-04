-- Enable RLS on pain_history table
ALTER TABLE pain_history ENABLE ROW LEVEL SECURITY;

-- Pain history policies
CREATE POLICY "Users can manage their own pain history"
  ON pain_history FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Users can view household members' pain history"
  ON pain_history FOR SELECT
  USING (user_id IN (
    SELECT user_id FROM household_members
    WHERE household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  ));
