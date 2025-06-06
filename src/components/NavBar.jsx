function NavBar() {
    return <nav className='navbar'>
        <div className='nav-brand'>
            <link to="/">Hotspot</link>
        </div>
        <div className='nav-links'>
            <link to="/" className="nav-link">Home</link>
            <link to="/mapify" className="nav-link">Mapify</link>
        </div>
    </nav>
}

export default NavBar;
