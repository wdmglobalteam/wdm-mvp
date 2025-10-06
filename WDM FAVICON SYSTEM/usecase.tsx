import { useFavicon } from '@/lib/favicon';

export default function MyApp() {
  const favicon = useFavicon();
  
  return (
    <button onClick={() => favicon.showSuccess()}>
      Test Favicon
    </button>
  );
}