-- Fix: sort_order used Date.now() (~1.7e12) which overflows `integer`
-- (max ~2.1e9), so inserts failed silently. Widen to bigint.
alter table grocery_items
  alter column sort_order type bigint;
