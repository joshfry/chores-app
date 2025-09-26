import StyledSample from './Sample.style'

export interface Props {
  className?: string
}

const Sample = ({ className = '' }: Props) => {
  return (
    <StyledSample className={className}>
      Sample
    </StyledSample>
  )
}

export default Sample
