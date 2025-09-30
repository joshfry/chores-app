import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useAuth } from '../../contexts/AuthContext'
import { api } from '../../services/api'
import type { Chore } from '../../types/api'

const Container = styled.div``

const Header = styled.div``

const Title = styled.h1``

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>``

const Grid = styled.div``

const ChoreCard = styled.div``

const ChoreHeader = styled.div``

const ChoreTitle = styled.h3``

const ChoreDescription = styled.p``

const ChoreFooter = styled.div``

const ChoreStats = styled.div``

const Badge = styled.span<{
  variant: 'easy' | 'medium' | 'hard' | 'recurring' | 'one-time'
}>``

const Actions = styled.div``

const LoadingCard = styled(ChoreCard)``

const ErrorCard = styled(ChoreCard)``

const EmptyState = styled.div``

const PointsDisplay = styled.div``

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
    console.log('Create chore clicked')
  }

  const handleEditChore = (choreId: number) => {
    console.log('Edit chore:', choreId)
  }

  const handleDeleteChore = (choreId: number) => {
    console.log('Delete chore:', choreId)
  }

  const handleAssignChore = (choreId: number) => {
    console.log('Assign chore:', choreId)
  }

  if (isLoading) {
    return (
      <Container data-testid="chores-page">
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
      <Container data-testid="chores-page">
        <Header>
          <Title>Chores</Title>
        </Header>
        <Grid>
          <ErrorCard>
            <div>Error: {error}</div>
            <Button onClick={fetchChores}>Retry</Button>
          </ErrorCard>
        </Grid>
      </Container>
    )
  }

  return (
    <Container data-testid="chores-page">
      <Header>
        <Title>Chores</Title>
        {state.user?.role === 'parent' && (
          <Button onClick={handleCreateChore} data-testid="add-chore-button">
            Create New Chore
          </Button>
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
              <Button
                onClick={handleCreateChore}
                data-testid="add-first-chore-button"
              >
                Create Your First Chore
              </Button>
            )}
          </EmptyState>
        ) : (
          chores.map((chore) => (
            <ChoreCard key={chore.id} data-testid="chore-card">
              <ChoreHeader>
                <div>
                  <ChoreTitle data-testid="chore-title">
                    {chore.title}
                  </ChoreTitle>
                  <ChoreStats>
                    <PointsDisplay data-testid="chore-points">
                      <span className="icon">⭐</span>
                      {chore.points} points
                    </PointsDisplay>
                    <span>•</span>
                    <Badge variant={chore.difficulty}>{chore.difficulty}</Badge>
                    <span>•</span>
                    <Badge
                      variant={chore.isRecurring ? 'recurring' : 'one-time'}
                    >
                      {chore.isRecurring ? 'Recurring' : 'One-time'}
                    </Badge>
                  </ChoreStats>
                </div>
                <PointsDisplay data-testid="chore-points">
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
