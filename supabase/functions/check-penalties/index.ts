import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const DAILY_RULE_IDS = ['R01','R03','R05','R06','R07','R08','R10','R11','R12','R13']
const TOTAL_DAILY = DAILY_RULE_IDS.length

serve(async (req) => {
  // Allow cron scheduler or manual POST
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  // Yesterday's date
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const checkDate = yesterday.toISOString().split('T')[0]

  // Prevent duplicate penalties for the same date
  const { data: existing } = await supabase
    .from('penalties')
    .select('id')
    .eq('penalty_date', checkDate)
    .limit(1)

  if (existing && existing.length > 0) {
    return new Response(JSON.stringify({ skipped: true, reason: 'already processed', date: checkDate }), {
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Fetch all users
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, name')

  if (usersError || !users) {
    return new Response(JSON.stringify({ error: 'failed to fetch users' }), { status: 500 })
  }

  // Fetch yesterday's completed daily rule logs
  const { data: logs } = await supabase
    .from('daily_logs')
    .select('user_id, rule_id')
    .eq('log_date', checkDate)
    .eq('completed', true)
    .in('rule_id', DAILY_RULE_IDS)

  // Count completed rules per user
  const countByUser: Record<string, number> = {}
  for (const { user_id } of logs ?? []) {
    countByUser[user_id] = (countByUser[user_id] ?? 0) + 1
  }

  // Find failing users (did not complete all daily rules)
  const failingUsers = users.filter(u => (countByUser[u.id] ?? 0) < TOTAL_DAILY)

  if (failingUsers.length === 0) {
    return new Response(JSON.stringify({ skipped: true, reason: 'all users completed rules', date: checkDate }))
  }

  // Insert one penalty per failing user
  const penaltiesToInsert = failingUsers.map(u => ({
    triggered_by: u.id,
    penalty_date: checkDate,
    km_owed: 5,
  }))

  const { data: inserted, error: insertError } = await supabase
    .from('penalties')
    .insert(penaltiesToInsert)
    .select()

  if (insertError) {
    return new Response(JSON.stringify({ error: insertError.message }), { status: 500 })
  }

  return new Response(
    JSON.stringify({ success: true, date: checkDate, penalties: inserted?.length ?? 0, failingUsers: failingUsers.map(u => u.name) }),
    { headers: { 'Content-Type': 'application/json' } },
  )
})
