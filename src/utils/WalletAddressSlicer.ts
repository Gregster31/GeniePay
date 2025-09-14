/**
 * Shortens a wallet address for display purposes
 * @param address - The full wallet address
 * @param startChars - Number of characters to show at start (default: 6)
 * @param endChars - Number of characters to show at end (default: 4)
 * @returns Shortened address like "0x1234...abcd"
 */
export const sliceAddress = (
  address: string, 
  startChars: number = 6, 
  endChars: number = 4
): string => {
  if (!address) return ''
  if (address.length <= startChars + endChars) return address
  
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`
}