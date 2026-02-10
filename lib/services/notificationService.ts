import { createClient } from '@/lib/supabase/client';
import { SpecialOccasion } from './authService';

const supabase = createClient();

export async function checkAndCreateOccasionReminders(userId: string, occasions: SpecialOccasion[]) {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (const occasion of occasions) {
            if (!occasion.reminder_enabled) continue;

            // calculate the next occurrence of this occasion
            const occDate = new Date(occasion.date);
            occDate.setFullYear(today.getFullYear());
            occDate.setHours(0, 0, 0, 0);

            // if date has passed this year, check next year
            if (occDate < today) {
                occDate.setFullYear(today.getFullYear() + 1);
            }

            // calculate days until occasion
            const daysUntil = Math.floor((occDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

            // create notification if within 7 days
            if (daysUntil >= 0 && daysUntil <= 7) {
                // check if notification already exists for this occasion today
                const notificationKey = `occasion_${occasion.id}_${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                
                const { data: existing } = await supabase
                    .from('notifications')
                    .select('id')
                    .eq('user_id', userId)
                    .eq('type', 'system')
                    .ilike('message', `%${occasion.name}%`)
                    .gte('created_at', new Date(today).toISOString())
                    .lt('created_at', new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString());

                // only create if notification doesn't already exist
                if (!existing || existing.length === 0) {
                    let title = '';
                    let message = '';

                    if (daysUntil === 0) {
                        title = "Today's the Day!";
                        message = `${occasion.name} is today! Don't forget to place an order with us!`;
                    } else if (daysUntil === 1) {
                        title = 'Tomorrow!';
                        message = `${occasion.name} is tomorrow! Time to order a cake!`;
                    } else {
                        title = 'Upcoming Occasion';
                        message = `${occasion.name} is coming up in ${daysUntil} days. Get your cake order ready!`;
                    }

                    const { error } = await supabase
                        .from('notifications')
                        .insert([{
                            user_id: userId,
                            title,
                            message,
                            type: 'system',
                            read: false,
                            created_at: new Date().toISOString()
                        }]);

                    if (error) {
                        console.error('Error creating occasion reminder notification:', error);
                    } else {
                        // dispatch event to update notification UI
                        window.dispatchEvent(new Event('notifications-updated'));
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error checking occasion reminders:', error);
    }
}
