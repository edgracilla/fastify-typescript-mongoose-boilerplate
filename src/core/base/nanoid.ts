import { customAlphabet } from 'nanoid'

const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz'
const nanoid = customAlphabet(alphabet, 21)

export default nanoid
