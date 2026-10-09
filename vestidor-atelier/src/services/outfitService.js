import { supabase } from '../lib/supabase'

export async function listOutfits() {
  const { data, error } = await supabase.from('outfits').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createOutfit(userId, payload) {
  const { data, error } = await supabase.from('outfits').insert({ user_id: userId, ...payload }).select().single()
  if (error) throw error
  return data
}

export async function updateOutfit(id, patch) {
  const { data, error } = await supabase.from('outfits').update(patch).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteOutfit(id) {
  const { error } = await supabase.from('outfits').delete().eq('id', id)
  if (error) throw error
}
