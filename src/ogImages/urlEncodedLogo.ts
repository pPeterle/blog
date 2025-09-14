import fs from 'fs'

const LOGO_FILE = './src/assets/logo.png'

const svgString = fs.readFileSync(LOGO_FILE, 'utf-8')
const encodedSVG = 'data:image/png,' + encodeURIComponent(svgString)

export default encodedSVG
