let globalVectorStore = null;

export function setVectorStore(store) {
  globalVectorStore = store;
}

export function getVectorStore() {
  return globalVectorStore;
}