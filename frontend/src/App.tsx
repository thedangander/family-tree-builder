import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { TreeEditorPage } from './pages/TreeEditorPage';
import { TreeListPage } from './pages/TreeListPage';

function App() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/trees" element={<TreeListPage />} />
          <Route path="/tree/:treeId" element={<TreeEditorPage />} />
        </Routes>
      </Layout>
    </Box>
  );
}

export default App;
