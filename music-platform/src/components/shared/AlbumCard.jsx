const AlbumCard = ({ album, onClick }) => (
  <div className="album-card" onClick={onClick}>
    <img src={album.thumbnail_url} alt={album.title} className="album-cover" />
    <div className="album-info">
      <p className="album-title">{album.title}</p>
      <p className="album-artist">{album.artist}</p>
      {album.year && <p className="album-year">{album.year}</p>}
    </div>
  </div>
);

export default AlbumCard;