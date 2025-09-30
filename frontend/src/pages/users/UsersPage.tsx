import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useAuth } from '../../contexts/AuthContext'
import { api } from '../../services/api'
import type { User } from '../../types/api'

const Container = styled.div``

const Header = styled.div``

const Title = styled.h1``

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>``

const Card = styled.div``

const Table = styled.table``

const Thead = styled.thead``

const Th = styled.th``

const Tbody = styled.tbody``

const Tr = styled.tr``

const Td = styled.td``

const Badge = styled.span<{
  variant: 'parent' | 'child' | 'active' | 'inactive'
}>``

const Avatar = styled.div``

const UserInfo = styled.div``

const UserDetails = styled.div``

const Actions = styled.div``

const LoadingCard = styled(Card)``

const ErrorCard = styled(Card)``

const EmptyState = styled.div``

const UsersPage: React.FC = () => {
  const { state } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await api.getUsers()

      if (response.success) {
        setUsers(response.data || [])
      } else {
        setError(response.error || 'Failed to load users')
      }
    } catch (err: any) {
      setError(
        err.response?.data?.error || err.message || 'Failed to load users',
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateChild = () => {
    console.log('Create child clicked')
  }

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (isLoading) {
    return (
      <Container data-testid="users-page">
        <LoadingCard>Loading users...</LoadingCard>
      </Container>
    )
  }

  if (error) {
    return (
      <Container data-testid="users-page">
        <ErrorCard>
          <div>Error: {error}</div>
          <Button onClick={fetchUsers}>Retry</Button>
        </ErrorCard>
      </Container>
    )
  }

  return (
    <Container data-testid="users-page">
      <Header>
        <Title>Family Members</Title>
        {state.user?.role === 'parent' && (
          <Button onClick={handleCreateChild} data-testid="add-child-button">
            Add Child Account
          </Button>
        )}
      </Header>

      <Card>
        {users.length === 0 ? (
          <EmptyState>
            <div className="icon">👥</div>
            <div className="title">No family members found</div>
            <div className="subtitle">
              Start by adding child accounts to manage chores together.
            </div>
            {state.user?.role === 'parent' && (
              <Button
                onClick={handleCreateChild}
                data-testid="add-first-child-button"
              >
                Add Your First Child
              </Button>
            )}
          </EmptyState>
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>User</Th>
                <Th>Role</Th>
                <Th>Points</Th>
                <Th>Last Active</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {users.map((user) => (
                <Tr key={user.id}>
                  <Td>
                    <UserInfo>
                      <Avatar>{user.name.charAt(0).toUpperCase()}</Avatar>
                      <UserDetails>
                        <div className="name">{user.name}</div>
                        <div className="email">{user.email}</div>
                      </UserDetails>
                    </UserInfo>
                  </Td>
                  <Td>
                    <Badge variant={user.role}>{user.role}</Badge>
                  </Td>
                  <Td>{user.totalPoints || 0}</Td>
                  <Td>
                    {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
                  </Td>
                  <Td>
                    <Badge variant={user.isActive ? 'active' : 'inactive'}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </Td>
                  <Td>
                    <Actions>
                      <Button variant="secondary">Edit</Button>
                      {state.user?.role === 'parent' &&
                        user.id !== state.user.id && (
                          <Button variant="secondary">Remove</Button>
                        )}
                    </Actions>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </Card>
    </Container>
  )
}

export default UsersPage
