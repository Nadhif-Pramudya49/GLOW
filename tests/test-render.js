const { JSDOM } = require('jsdom');
const fs = require('fs');

const dataJs = fs.readFileSync('client/js/data.js', 'utf8');
const pageJs = fs.readFileSync('client/js/page-package.js', 'utf8');

const dom = new JSDOM(`<!DOCTYPE html><html><head>
  <script>
    window.State = {
      user: { name: 'Test' },
      package: { penginapan: [], workspaces: [], transport: null, activities: [] },
      isFavorite: () => false,
      calcTotal: () => 1000000,
      getProgress: () => 50
    };
    window.API_DATA = {
      penginapan: [{ id: 1, name: 'P1' }],
      workspace: [{ id: 2, name: 'W1' }],
      transport: [{ id: 3, name: 'T1' }],
      activities: [{ id: 4, name: 'A1' }]
    };
    window.el = (tag, cls, id) => {
      const e = document.createElement(tag);
      if(cls) e.className = cls;
      if(id) e.id = id;
      return e;
    };
    window.formatRupiah = (v) => 'Rp' + v;
    window.navigate = () => {};
    window.renderApp = () => {};
  </script>
  <script>${dataJs}</script>
  <script>${pageJs}</script>
</head><body><div id="app"></div>
  <script>
    try {
      const page = window.renderPackagePage();
      console.log('Page tag:', page.tagName);
      console.log('Page length:', page.innerHTML.length);
    } catch(e) {
      console.error('ERROR RENDER:', e);
    }
  </script>
</body></html>`, { runScripts: "dangerously" });
