import { createClient } from '@/lib/supabase/client';
import { SpecialOccasion } from './authService';

const supabase = createClient();

export async function checkAndCreateOccasionReminders(userId: string, occasions: SpecialOccasion[]) {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (const occasion of occasions) {
            if (!occasion.reminder_enabled) continue;

            // Robust date parsing (YYYY-MM-DD) to avoid timezone issues
            const [y, m, d] = occasion.date.split('-').map(Number);
            let targetDate = new Date(y, m - 1, d); // Local time 00:00:00

            if (occasion.type === 'Birthday' || occasion.type === 'Anniversary') {
                // Recurring: Adjust to current or next year
                targetDate.setFullYear(today.getFullYear());
                if (targetDate < today) {
                    targetDate.setFullYear(today.getFullYear() + 1);
                }
            }
            // For others (Graduation, etc.), targetDate stays as the specific date entered

            // calculate days until occasion
            const diffTime = targetDate.getTime() - today.getTime();
            const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            // create notification if within 7 days
            if (daysUntil >= 0 && daysUntil <= 7) {

                // CHECK 1: Has this occasion already been reminded this year?
                if (occasion.last_reminded_year === today.getFullYear()) {
                    continue;
                }

                // CHECK 2: (Legacy/Backup) check if notification already exists for this occasion today
                // We keep this as a secondary check just in case, but the main driver is now the DB flag.
                const notificationKey = `occasion_${occasion.id}_${today.getFullYear()}`;

                const { data: existing } = await supabase
                    .from('notifications')
                    .select('id')
                    .eq('user_id', userId)
                    .eq('type', 'system')
                    .ilike('message', `%${occasion.name}%`)
                    .gte('created_at', new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString())
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
                        // CRITICAL: Update the occasion to mark it as reminded for this year
                        await supabase
                            .from('special_occasions')
                            .update({ last_reminded_year: today.getFullYear() } as any)
                            .eq('id', occasion.id);

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
