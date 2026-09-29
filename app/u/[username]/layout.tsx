import './reference-layout.css';
import SiteChrome from '@/app/components/SiteChrome';

export default function PublicProfileLayout({ children }: { children: React.ReactNode }) {
  return <SiteChrome>{children}</SiteChrome>;
}
