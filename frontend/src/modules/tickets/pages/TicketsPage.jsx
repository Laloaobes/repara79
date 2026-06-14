import React from 'react';

const TicketsPage = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>REPARA 79</h1>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    width: '100vw',
    backgroundColor: '#f8fafc', 
    margin: 0,
    padding: 0,
    boxSizing: 'border-box',
  },
  title: {
    fontSize: '4rem',
    fontWeight: '800',
    color: '#0f172a', 
    fontFamily: 'system-ui, -apple-system, sans-serif',
    letterSpacing: '-0.05em',
    textTransform: 'uppercase',
  },
};

export default TicketsPage;