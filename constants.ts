
import { Person, Memory } from './types';

export const MOCK_PEOPLE: Person[] = [
  {
    id: '1',
    name: 'Margaret',
    role: 'Mom',
    memoriesCount: 42,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCwGKE0dJ9Gkn6_lFR2LEGfut8ENzzFtPKI_2CxZuo2t4AhzsfSx6t_dtvCDRi2oTiFGAmr55qcjgSZNTuFslt-6mlPeeJwXsgl7apunuYjyaiJKc1jOh-RM-G6rKKwGyxd7o3bJynz9vXzOjvDHGhvQ9VAkWhelIbX3ChLSAstO5EYYAyaYgkbGTyVh6C-kfAGO01n73ko9fu4BWQi4cUUvTEtrR1xF7WBNq8PnTtvYA0FiRT9DD3yCR7EFv0FsE65fURo9-RSEEU'
  },
  {
    id: '2',
    name: 'Daniel',
    role: 'Partner',
    memoriesCount: 115,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCvbaAnB0BC6-MpgWaCJwU5s7eyo_6MaK3lE8r-Pc3kMRaw_T_pj5Ir0VXHhIihRBTcfg8dlCV9vF3zV-k6i_ll_AW8vhJ0CN6a2ywTmZWB4qNKpyN5UvsA6Q2h3anNpvzVHk6svyBAgospMO_1jumVGHupgDUfUOmclpjqUTRViqfXOC_Csu6U4G4O2C0tlSTYMwFZwVooZ7gOzzYmw-hIUPzvGYbleTjPknpsvfFTKVE6ZQU0z8xkk_QLaej0Rv8icFigbjZS2nw'
  },
  {
    id: '3',
    name: 'Sarah',
    role: 'Best Friend',
    memoriesCount: 8,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuApdER7yuV0iUSlgAave8CLYT0aIFzWwbWgEvjKF2dW3qNu3TwCdfdAEZeY6SSH5lIMDUBEst7o3C1g1LO5IYOo-pQKVdEOwK_vtXe2D7y6DeEoz2QZv0UGGB93Vx5bLVw2YCxa8e_jXn75qHBv250E18yQecS_ze9AsajgKN6HtkTZksJDUwJTLSvJutyQ3yFOPLw0fRDuZWlXKmvgiFiORymmf-TZfP23d2RD2i4sgsbKOTxkOzRtEYuuivjK9mNA3xKj4oA5nhM'
  }
];

export const MOCK_MEMORIES: Memory[] = [
  {
    id: 'm1',
    title: 'Morning walk clarity',
    date: 'Oct 24, 2024',
    time: '10:42 AM',
    location: 'Central Park',
    mood: 'Calm',
    content: '"Feeling peaceful and present. The air was crisp and the rustling leaves created the most soothing sound."',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBnV_DQ-viQGOYjTUbFOx1cOiKNa5MxLb6vzxoLJtuEbY2LYwggKi7eLEyQbyONCygaZB5rbaSsOvv72g8B5456GePcKNGmZC3m2Lxj3-j3PyZoMuLc8McGpwDDPMB2chOtGkpVZNKHf5-F36P5G0uf9i_Cj85gdT8eG2zieEaAZ7dSlmvp9U9FXtnTuwdRXoN6BPz3NqLcsyuEYY2NBi9h0DFhL45RnrUNLY4fu8PPluRBK-oqmgb6T5cCMP66SuR3yoUJ1-a-RWw',
    peopleIds: []
  },
  {
    id: 'm2',
    title: 'Coffee at the marina',
    date: 'Oct 24, 2023',
    time: '09:00 AM',
    location: 'The Marina',
    mood: 'Peaceful',
    content: 'The morning mist was heavy, but the coffee was warm. A perfect moment of stillness before the day began.',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBuHVCUWym5wO5lD8OhzPsVv8cEMy7Rq_nGhGfgyBXqY6ZgP8zhL3OLUoebogecal-xqFwAb_01qkBmLfbZ4kPQ6IO6_mA_1UsiNkBESDSHLmZV-ZHRksbP50htiRDfeNZGz7R0DMEAd1gQF44HKh8OxfOU3ymNkL7GY3Loe1SI3d9J5gcXAvBqc5RZzs8TnAMkadEGQdIF-NTTjL0ePqZZOQsr_fCeVFF6Qu9r8dRBrFXv4tltGF2f9V3o3wt_RS_h7-veaeHGGlc',
    peopleIds: ['1'],
    isHighlight: true
  }
];

export const MOOD_TREND_DATA = [
  { day: 'M', value: 80 },
  { day: 'T', value: 50 },
  { day: 'W', value: 60 },
  { day: 'T', value: 110 },
  { day: 'F', value: 90 },
  { day: 'S', value: 30 },
  { day: 'S', value: 60 },
];
