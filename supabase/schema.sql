-- Custom Types
CREATE TYPE user_role AS ENUM ('student', 'vendor', 'admin');
CREATE TYPE verification_badge AS ENUM ('none', 'blue', 'gold');
CREATE TYPE lost_found_type AS ENUM ('lost', 'found');

-- 1. Profiles Table (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  matric_number TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'student',
  badge verification_badge DEFAULT 'none',
  is_verified BOOLEAN DEFAULT false,
  rating NUMERIC(3, 2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  rating_count INTEGER DEFAULT 0,
  follower_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  allows_messages BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Conversations & Messaging
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_one UUID REFERENCES profiles(id) ON DELETE CASCADE,
  participant_two UUID REFERENCES profiles(id) ON DELETE CASCADE,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(participant_one, participant_two)
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own conversations." ON conversations FOR SELECT USING (auth.uid() = participant_one OR auth.uid() = participant_two);
CREATE POLICY "Users can start conversations." ON conversations FOR INSERT WITH CHECK (auth.uid() = participant_one OR auth.uid() = participant_two);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view messages in their conversations." ON messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM conversations 
    WHERE id = messages.conversation_id 
    AND (participant_one = auth.uid() OR participant_two = auth.uid())
  )
);
CREATE POLICY "Users can send messages if recipient allows." ON messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM conversations c
    JOIN profiles p ON (p.id = CASE WHEN c.participant_one = auth.uid() THEN c.participant_two ELSE c.participant_one END)
    WHERE c.id = messages.conversation_id AND p.allows_messages = true
  )
);

-- Update last_message_at on conversation
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations SET last_message_at = NEW.created_at WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conversation_timestamp_trigger
AFTER INSERT ON messages
FOR EACH ROW EXECUTE FUNCTION update_conversation_timestamp();

-- 3. Houses
CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  price NUMERIC NOT NULL,
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Listings viewable by everyone." ON listings FOR SELECT USING (true);
CREATE POLICY "Verified users can insert listings." ON listings FOR INSERT WITH CHECK (auth.uid() = user_id AND (SELECT is_verified FROM profiles WHERE id = auth.uid()) = true);
CREATE POLICY "Users can update own listings." ON listings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own listings." ON listings FOR DELETE USING (auth.uid() = user_id);

-- 4. Services
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  vendor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Services viewable by everyone." ON services FOR SELECT USING (true);
CREATE POLICY "Verified users/vendors can insert services." ON services FOR INSERT WITH CHECK (auth.uid() = vendor_id AND (SELECT is_verified FROM profiles WHERE id = auth.uid()) = true);
CREATE POLICY "Users can update own services." ON services FOR UPDATE USING (auth.uid() = vendor_id);
CREATE POLICY "Users can delete own services." ON services FOR DELETE USING (auth.uid() = vendor_id);

-- 5. Marketplace Items
CREATE TABLE marketplace_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  description TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE marketplace_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Items viewable by everyone." ON marketplace_items FOR SELECT USING (true);
CREATE POLICY "Verified users can insert items." ON marketplace_items FOR INSERT WITH CHECK (auth.uid() = seller_id AND (SELECT is_verified FROM profiles WHERE id = auth.uid()) = true);
CREATE POLICY "Users can update own items." ON marketplace_items FOR UPDATE USING (auth.uid() = seller_id);
CREATE POLICY "Users can delete own items." ON marketplace_items FOR DELETE USING (auth.uid() = seller_id);

-- 6. Requests
CREATE TABLE requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'open',
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Requests viewable by everyone." ON requests FOR SELECT USING (true);
CREATE POLICY "Any authenticated user can insert requests." ON requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own requests." ON requests FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own requests." ON requests FOR DELETE USING (auth.uid() = user_id);

-- 7. Request Replies
CREATE TABLE request_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE request_replies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Replies viewable by everyone." ON request_replies FOR SELECT USING (true);
CREATE POLICY "Any authenticated user can reply." ON request_replies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own replies." ON request_replies FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own replies." ON request_replies FOR DELETE USING (auth.uid() = user_id);

-- 8. Lost and Found
CREATE TABLE lost_found (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image TEXT,
  location TEXT NOT NULL,
  type lost_found_type NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE lost_found ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lost/Found viewable by everyone." ON lost_found FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert." ON lost_found FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own." ON lost_found FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own." ON lost_found FOR DELETE USING (auth.uid() = user_id);

-- 9. Announcements
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  cover_image TEXT,
  admin_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Announcements viewable by everyone." ON announcements FOR SELECT USING (true);
CREATE POLICY "Only admins can insert." ON announcements FOR INSERT WITH CHECK (
  auth.uid() = admin_id AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);
CREATE POLICY "Only admins can update." ON announcements FOR UPDATE USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);
CREATE POLICY "Only admins can delete." ON announcements FOR DELETE USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- 10. Follows
CREATE TABLE follows (
  follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id)
);

ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Follows viewable by everyone." ON follows FOR SELECT USING (true);
CREATE POLICY "Users can follow." ON follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow." ON follows FOR DELETE USING (auth.uid() = follower_id);

-- 11. Reviews/Ratings
CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rater_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  target_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(rater_id, target_id)
);

ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Ratings viewable by everyone." ON ratings FOR SELECT USING (true);
CREATE POLICY "Users can rate." ON ratings FOR INSERT WITH CHECK (auth.uid() = rater_id);
CREATE POLICY "Users can update rating." ON ratings FOR UPDATE USING (auth.uid() = rater_id);
CREATE POLICY "Users can delete rating." ON ratings FOR DELETE USING (auth.uid() = rater_id);

-- 12. Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications." ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert notifications." ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own (mark read)." ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- 13. Saved Items (Bookmarking)
CREATE TABLE saved_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  item_id UUID NOT NULL, -- Generic ID, can be house, service, or marketplace item
  item_type TEXT NOT NULL, -- 'house', 'service', 'marketplace'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, item_id)
);

ALTER TABLE saved_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own saved items." ON saved_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can save items." ON saved_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unsave items." ON saved_items FOR DELETE USING (auth.uid() = user_id);

-- TRIGGERS & FUNCTIONS
CREATE OR REPLACE FUNCTION update_profile_rating()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE profiles
    SET rating = (SELECT ROUND(AVG(rating)::NUMERIC, 2) FROM ratings WHERE target_id = NEW.target_id),
        rating_count = (SELECT COUNT(*) FROM ratings WHERE target_id = NEW.target_id)
    WHERE id = NEW.target_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE profiles
    SET rating = COALESCE((SELECT ROUND(AVG(rating)::NUMERIC, 2) FROM ratings WHERE target_id = OLD.target_id), 0),
        rating_count = (SELECT COUNT(*) FROM ratings WHERE target_id = OLD.target_id)
    WHERE id = OLD.target_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profile_rating_trigger
AFTER INSERT OR UPDATE OR DELETE ON ratings
FOR EACH ROW EXECUTE FUNCTION update_profile_rating();

CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER listings_updated_at BEFORE UPDATE ON listings FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER marketplace_items_updated_at BEFORE UPDATE ON marketplace_items FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER requests_updated_at BEFORE UPDATE ON requests FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE OR REPLACE FUNCTION update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE profiles SET following_count = following_count + 1 WHERE id = NEW.follower_id;
    UPDATE profiles SET follower_count = follower_count + 1 WHERE id = NEW.following_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE profiles SET following_count = following_count - 1 WHERE id = OLD.follower_id;
    UPDATE profiles SET follower_count = follower_count - 1 WHERE id = OLD.following_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_follow_counts_trigger
AFTER INSERT OR DELETE ON follows
FOR EACH ROW EXECUTE FUNCTION update_follow_counts();

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, is_verified)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), 'student', true);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
