-- Enable Automatic Notifications for Order Status Updates
-- Run this script in your Supabase Dashboard -> SQL Editor

-- 1. Create the function that runs when an order changes
CREATE OR REPLACE FUNCTION public.handle_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger if the status has actually changed
  IF OLD.status <> NEW.status THEN
    INSERT INTO public.notifications (user_id, title, message, type, read)
    VALUES (
      NEW.user_id,
      'Order Update',  -- Removed Emoji
      'Your order #' || SUBSTRING(NEW.id::text, 1, 8) || ' is now ' || NEW.status || '.',
      'order',
      false
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create the trigger on the orders table
DROP TRIGGER IF EXISTS on_order_status_change ON public.orders;

CREATE TRIGGER on_order_status_change
AFTER UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.handle_order_status_change();

SELECT 'Trigger updated successfully. Emojis removed.' as result;
