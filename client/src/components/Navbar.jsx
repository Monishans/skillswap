import { NavLink, Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link to="/" className="logo">Skill<span>Swap</span></Link>
        <nav className="nav-links">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/explore">Explore Skills</NavLink>
          <NavLink to="/matches">My Matches</NavLink>
          <NavLink to="/add" className="nav-cta">Add Profile</NavLink>
        </nav>
      </div>
    </header>
  );
}
