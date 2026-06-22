const Avatar = ({ src, username, size = 64 }) => {
  if (src) {
    return <img src={src} alt={username} className="avatar-img" style={{ width: size, height: size }} />;
  }

  const initial = username?.charAt(0)?.toUpperCase() || '?';

  return (
    <div className="avatar-fallback" style={{ width: size, height: size, fontSize: size / 2 }}>
      {initial}
    </div>
  );
};

export default Avatar;