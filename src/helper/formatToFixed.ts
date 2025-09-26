const formatToFixed = (value: string | number, digitsCount: number): string => {
  value = String(value)

  if (!/\./.test(value)) {
    return value
  }

  const [int, digits] = value.split(".")

  if (digitsCount) {
    return int + "." + digits.substring(0, digitsCount)
  }

  return int
}

export default formatToFixed
