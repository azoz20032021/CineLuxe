export default function TokenWarning(){
  const token = import.meta.env.VITE_TMDB_TOKEN as string | undefined;
  if(token && token.trim() !== '') return null;
  return (
    <div style={{background:'#6b0000', color:'#fff', padding:'8px 12px', textAlign:'center', fontWeight:600}}>
      Warning: TMDB token not set. Live movie data will fall back to sample data. Add VITE_TMDB_TOKEN to a local env file and restart the dev server.
    </div>
  )
}
