-- Retired object keys cannot be reattached while an R2 deletion is in flight,
-- including when another request already validated the old URL.
CREATE TABLE menu_photo_removals (
  object_key TEXT PRIMARY KEY NOT NULL,
  item_id TEXT NOT NULL,
  deleted INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX menu_photo_removals_pending ON menu_photo_removals(item_id) WHERE deleted = 0;

CREATE TRIGGER menu_photo_guard_insert BEFORE INSERT ON menu_items
WHEN NEW.image_url IS NOT NULL AND EXISTS (
  SELECT 1 FROM menu_photo_removals
  WHERE substr(NEW.image_url, -length(object_key) - 1) = '/' || object_key
)
BEGIN
  SELECT RAISE(ABORT, 'Menu photo was removed. Upload it again.');
END;

CREATE TRIGGER menu_photo_guard_update BEFORE UPDATE OF image_url ON menu_items
WHEN NEW.image_url IS NOT NULL AND EXISTS (
  SELECT 1 FROM menu_photo_removals
  WHERE substr(NEW.image_url, -length(object_key) - 1) = '/' || object_key
)
BEGIN
  SELECT RAISE(ABORT, 'Menu photo was removed. Upload it again.');
END;
