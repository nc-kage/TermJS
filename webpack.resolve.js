/* eslint-disable quote-props */
const path = require('path');

module.exports = {
  resolve: {
    extensions: ['.ts', '.js', '.json'],
    modules: ['node_modules'],
    alias: {
      '@ReactTerm': path.resolve(__dirname, 'packages/react-term/src/ReactTerm'),
      '@TerminalsOrchestrator': path.resolve(__dirname, 'packages/terminals-orchestrator/src/TerminalsOrchestrator'),
      '@Modals': path.resolve(__dirname, 'packages/modals-plugin/src/Modals'),
      '@StatusBar': path.resolve(__dirname, 'packages/status-bar-plugin/src/StatusBar'),
      '@CommandSearch': path.resolve(__dirname, 'packages/command-search-plugin/src/CommandSearch'),
      '@HistorySearch': path.resolve(__dirname, 'packages/history-search-plugin/src/HistorySearch'),
      '@Autocomplete': path.resolve(__dirname, 'packages/autocomplete-plugin/src/Autocomplete'),
      '@Dropdown': path.resolve(__dirname, 'packages/dropdown-plugin/src/Dropdown'),
      '@ContextMenu': path.resolve(__dirname, 'packages/context-menu-plugin/src/ContextMenu'),
      '@Term': path.resolve(__dirname, 'packages/term/src/Term'),
      '@general': path.resolve(__dirname, 'general'),
    },
  },
};
