import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  if (pathnames.length === 0) return null;

  return (
    <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-8">
      <Link to="/" className="hover:text-primary transition-colors flex items-center gap-1">
        <Home size={12} />
        Home
      </Link>
      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;

        return (
          <div key={name} className="flex items-center gap-2">
            <ChevronRight size={12} className="text-zinc-700" />
            {isLast ? (
              <span className="text-zinc-300">{name}</span>
            ) : (
              <Link to={routeTo} className="hover:text-primary transition-colors">
                {name}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
