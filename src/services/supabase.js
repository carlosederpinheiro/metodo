import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mwrxcpfuhjbjjtidlooy.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_W8Mta23Q68w1n9wudqSclw_wplcidSD';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
