import apiClient from '../../api/axios';

export const evmApi = {
  // Candidates & Live Voting
  getCandidates: async () => {
    const res = await apiClient.get('/worker/candidates');
    return res.data?.data;
  },
  castVote: async (candidateId, candidateName) => {
    const res = await apiClient.post('/worker/vote', { candidateId, candidateName });
    return res.data;
  },

  // EVM Voting System (karkarta_ tables)
  getEvmElectionData: async () => {
    const res = await apiClient.get('/worker/evm/election');
    return res.data?.data;
  },
  castEvmVote: async (payload) => {
    const res = await apiClient.post('/worker/evm/vote', payload);
    return res.data;
  },
  addEvmCandidate: async (payload) => {
    const res = await apiClient.post('/worker/evm/candidate', payload);
    return res.data;
  },
  updateEvmCandidate: async (id, payload) => {
    const res = await apiClient.put(`/worker/evm/candidate/${id}`, payload);
    return res.data;
  },
  deleteEvmCandidate: async (id) => {
    const res = await apiClient.delete(`/worker/evm/candidate/${id}`);
    return res.data;
  },
  resetEvmVotes: async () => {
    const res = await apiClient.post('/worker/evm/reset-votes');
    return res.data;
  },
  updateEvmSettings: async (payload) => {
    const res = await apiClient.put('/worker/evm/settings', payload);
    return res.data;
  },
  updateEvmElection: async (payload) => {
    const res = await apiClient.put('/worker/evm/election', payload);
    return res.data;
  },
  startEvmElection: async (payload) => {
    const res = await apiClient.post('/worker/evm/start-election', payload);
    return res.data;
  },
  endEvmElection: async () => {
    const res = await apiClient.post('/worker/evm/end-election');
    return res.data;
  },
};
