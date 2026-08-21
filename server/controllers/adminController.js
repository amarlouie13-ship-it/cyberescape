import { supabaseAdmin } from '../config/supabase.js';

export async function listRooms(_req, res, next) {
  try {
    if (!supabaseAdmin) {
      return res.json({ rooms: [] });
    }
    const { data, error } = await supabaseAdmin.from('rooms').select('*').order('order_number', { ascending: true });
    if (error) throw error;
    res.json({ rooms: data ?? [] });
  } catch (error) {
    next(error);
  }
}

export async function createRoom(req, res, next) {
  try {
    const payload = req.body ?? {};
    if (!supabaseAdmin) return res.status(501).json({ message: 'Supabase not configured.' });
    const { data, error } = await supabaseAdmin.from('rooms').insert(payload).select('*').single();
    if (error) throw error;
    res.status(201).json({ room: data });
  } catch (error) {
    next(error);
  }
}

export async function updateRoom(req, res, next) {
  try {
    if (!supabaseAdmin) return res.status(501).json({ message: 'Supabase not configured.' });
    const { data, error } = await supabaseAdmin.from('rooms').update(req.body ?? {}).eq('id', req.params.id).select('*').single();
    if (error) throw error;
    res.json({ room: data });
  } catch (error) {
    next(error);
  }
}

export async function deleteRoom(req, res, next) {
  try {
    if (!supabaseAdmin) return res.status(501).json({ message: 'Supabase not configured.' });
    const { error } = await supabaseAdmin.from('rooms').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ message: 'Room deleted.' });
  } catch (error) {
    next(error);
  }
}

export async function listPuzzles(_req, res, next) {
  try {
    if (!supabaseAdmin) {
      return res.json({ puzzles: [] });
    }
    const { data, error } = await supabaseAdmin.from('puzzles').select('*, rooms:room_id(room_number,title)').order('order_number', { ascending: true });
    if (error) throw error;
    res.json({ puzzles: data ?? [] });
  } catch (error) {
    next(error);
  }
}

export async function createPuzzle(req, res, next) {
  try {
    if (!supabaseAdmin) return res.status(501).json({ message: 'Supabase not configured.' });
    const { data, error } = await supabaseAdmin.from('puzzles').insert(req.body ?? {}).select('*').single();
    if (error) throw error;
    res.status(201).json({ puzzle: data });
  } catch (error) {
    next(error);
  }
}

export async function updatePuzzle(req, res, next) {
  try {
    if (!supabaseAdmin) return res.status(501).json({ message: 'Supabase not configured.' });
    const { data, error } = await supabaseAdmin.from('puzzles').update(req.body ?? {}).eq('id', req.params.id).select('*').single();
    if (error) throw error;
    res.json({ puzzle: data });
  } catch (error) {
    next(error);
  }
}

export async function deletePuzzle(req, res, next) {
  try {
    if (!supabaseAdmin) return res.status(501).json({ message: 'Supabase not configured.' });
    const { error } = await supabaseAdmin.from('puzzles').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ message: 'Puzzle deleted.' });
  } catch (error) {
    next(error);
  }
}

