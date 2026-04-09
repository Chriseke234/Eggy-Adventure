import { supabase } from './supabase';
import type { HatchResult } from './gemini';

export async function saveSession(userId: string, missionId: string, missionName: string, prompt: string, result: HatchResult, roundNumber: number = 1) {
  const { data, error } = await supabase
    .from('sessions')
    .insert({
      user_id: userId,
      mission_id: missionId,
      mission_name: missionName,
      prompt: prompt,
      output_text: result.output_text,
      round_number: roundNumber,
      scores: {
        clarity: result.score_clarity,
        specificity: result.score_specificity,
        creativity: result.score_creativity,
        effectiveness: result.score_effectiveness
      },
      feedback_strength: result.feedback_strength,
      feedback_tip: result.feedback_tip,
      eggy_reaction: result.eggy_reaction
    });

  if (error) throw error;
  return data;
}
