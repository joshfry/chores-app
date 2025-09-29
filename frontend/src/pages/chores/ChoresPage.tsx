import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useAuth } from '../../contexts/AuthContext'
import { api } from '../../services/api'
import type { Chore } from '../../types/api'

const Container = styled.div`
  max-width: 1200px;
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
`

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;

  ${(props) =>
    props.variant === 'secondary'
      ? `
    background: white;
    border: 1px solid #d1d5db;
    color: #374151;
    
    &:hover {
      background: #f9fafb;
    }
  `
      : `
    background: #667eea;
    color: white;
    
    &:hover {
      background: #5a67d8;
    }
  `}
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
`

const ChoreCard = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
`

const ChoreHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`

const ChoreTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
`

const ChoreDescription = styled.p`
  color: #6b7280;
  font-size: 0.875rem;
  line-height: 1.4;
  margin-bottom: 1rem;
`

const ChoreFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const ChoreStats = styled.div`
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: #6b7280;
`

const Badge = styled.span<{
  variant: 'easy' | 'medium' | 'hard' | 'recurring' | 'one-time'
}>`
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;

  ${(props) => {
    switch (props.variant) {
      case 'easy':
        return 'background: #dcfce7; color: #16a34a;'
      case 'medium':
        return 'background: #fef3c7; color: #d97706;'
      case 'hard':
        return 'background: #fee2e2; color: #dc2626;'
      case 'recurring':
        return 'background: #dbeafe; color: #1d4ed8;'
      case 'one-time':
        return 'background: #f3f4f6; color: #374151;'
      default:
        return 'background: #f3f4f6; color: #374151;'
    }
  }}
`

const Actions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`

const LoadingCard = styled(ChoreCard)`
  text-align: center;
  color: #6b7280;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
`

const ErrorCard = styled(ChoreCard)`
  text-align: center;
  color: #dc2626;
  background: #fef2f2;
  border-color: #fecaca;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`

const EmptyState = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: 3rem;

  .icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  .title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 0.5rem;
  }

  .subtitle {
    color: #6b7280;
    margin-bottom: 2rem;
  }
`

const PointsDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-weight: 500;
  color: #667eea;

  .icon {
    font-size: 1rem;
  }
`

const ChoresPage: React.FC = () => {
  const { state } = useAuth()
  const [chores, setChores] = useState<Chore[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchChores()
  }, [])

  const fetchChores = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await api.getChores()

      if (response.success) {
        setChores(response.data || [])
      } else {
        setError(response.error || 'Failed to load chores')
      }
    } catch (err: any) {
      setError(
        err.response?.data?.error || err.message || 'Failed to load chores',
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateChore = () => {
    // TODO: Implement create chore modal/form
    console.log('Create chore clicked')
  }

  const handleEditChore = (choreId: number) => {
    // TODO: Implement edit chore modal/form
    console.log('Edit chore:', choreId)
  }

  const handleDeleteChore = (choreId: number) => {
    // TODO: Implement delete chore confirmation
    console.log('Delete chore:', choreId)
  }

  const handleAssignChore = (choreId: number) => {
    // TODO: Implement assign chore to child
    console.log('Assign chore:', choreId)
  }

  if (isLoading) {
    return (
      <Container>
        <Header>
          <Title>Chores</Title>
        </Header>
        <Grid>
          <LoadingCard>Loading chores...</LoadingCard>
        </Grid>
      </Container>
    )
  }

  if (error) {
    return (
      <Container>
        <Header>
          <Title>Chores</Title>
        </Header>
        <Grid>
          <ErrorCard>
            <div>Error: {error}</div>
            <Button onClick={fetchChores} style={{ marginTop: '1rem' }}>
              Retry
            </Button>
          </ErrorCard>
        </Grid>
      </Container>
    )
  }

  return (
    <Container>
      <Header>
        <Title>Chores</Title>
        {state.user?.role === 'parent' && (
          <Button onClick={handleCreateChore}>Create New Chore</Button>
        )}
      </Header>

      <Grid>
        {chores.length === 0 ? (
          <EmptyState>
            <div className="icon">✅</div>
            <div className="title">No chores created yet</div>
            <div className="subtitle">
              Create your first chore to start managing family tasks.
            </div>
            {state.user?.role === 'parent' && (
              <Button onClick={handleCreateChore}>
                Create Your First Chore
              </Button>
            )}
          </EmptyState>
        ) : (
          chores.map((chore) => (
            <ChoreCard key={chore.id}>
              <ChoreHeader>
                <div>
                  <ChoreTitle>{chore.title}</ChoreTitle>
                  <div
                    style={{
                      display: 'flex',
                      gap: '0.5rem',
                      marginTop: '0.5rem',
                    }}
                  >
                    <Badge variant={chore.difficulty}>{chore.difficulty}</Badge>
                    <Badge
                      variant={chore.isRecurring ? 'recurring' : 'one-time'}
                    >
                      {chore.isRecurring ? 'Recurring' : 'One-time'}
                    </Badge>
                  </div>
                </div>
                <PointsDisplay>
                  <span className="icon">⭐</span>
                  <span>{chore.points}</span>
                </PointsDisplay>
              </ChoreHeader>

              <ChoreDescription>{chore.description}</ChoreDescription>

              <ChoreFooter>
                <ChoreStats>
                  {chore.isRecurring && chore.recurrencePattern && (
                    <span>Repeats: {chore.recurrencePattern}</span>
                  )}
                </ChoreStats>
              </ChoreFooter>

              {state.user?.role === 'parent' && (
                <Actions>
                  <Button
                    variant="secondary"
                    onClick={() => handleAssignChore(chore.id)}
                  >
                    Assign
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => handleEditChore(chore.id)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => handleDeleteChore(chore.id)}
                  >
                    Delete
                  </Button>
                </Actions>
              )}
            </ChoreCard>
          ))
        )}
      </Grid>
    </Container>
  )
}

export default ChoresPage
