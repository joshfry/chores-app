import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useAuth } from '../../contexts/AuthContext'
import { api } from '../../services/api'
import type { User } from '../../types/api'

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

const Card = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
`

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`

const Thead = styled.thead`
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
`

const Th = styled.th`
  text-align: left;
  padding: 0.75rem 1rem;
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
`

const Tbody = styled.tbody``

const Tr = styled.tr`
  border-bottom: 1px solid #e5e7eb;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: #f9fafb;
  }
`

const Td = styled.td`
  padding: 1rem;
  color: #1f2937;
`

const Badge = styled.span<{
  variant: 'parent' | 'child' | 'active' | 'inactive'
}>`
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;

  ${(props) => {
    switch (props.variant) {
      case 'parent':
        return 'background: #dbeafe; color: #1d4ed8;'
      case 'child':
        return 'background: #dcfce7; color: #16a34a;'
      case 'active':
        return 'background: #dcfce7; color: #16a34a;'
      case 'inactive':
        return 'background: #fee2e2; color: #dc2626;'
      default:
        return 'background: #f3f4f6; color: #374151;'
    }
  }}
`

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #667eea;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 500;
  margin-right: 0.75rem;
`

const UserInfo = styled.div`
  display: flex;
  align-items: center;
`

const UserDetails = styled.div`
  .name {
    font-weight: 500;
    color: #1f2937;
  }

  .email {
    color: #6b7280;
    font-size: 0.875rem;
  }
`

const Actions = styled.div`
  display: flex;
  gap: 0.5rem;
`

const LoadingCard = styled(Card)`
  padding: 3rem;
  text-align: center;
  color: #6b7280;
`

const ErrorCard = styled(Card)`
  padding: 2rem;
  text-align: center;
  color: #dc2626;
  background: #fef2f2;
  border-color: #fecaca;
`

const EmptyState = styled.div`
  padding: 3rem;
  text-align: center;
  color: #6b7280;

  .icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .title {
    font-size: 1.125rem;
    font-weight: 500;
    color: #1f2937;
    margin-bottom: 0.5rem;
  }

  .subtitle {
    margin-bottom: 1.5rem;
  }
`

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
    // TODO: Implement create child modal/form
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
      <Container>
        <LoadingCard>Loading users...</LoadingCard>
      </Container>
    )
  }

  if (error) {
    return (
      <Container>
        <ErrorCard>
          <div>Error: {error}</div>
          <Button onClick={fetchUsers} style={{ marginTop: '1rem' }}>
            Retry
          </Button>
        </ErrorCard>
      </Container>
    )
  }

  return (
    <Container>
      <Header>
        <Title>Family Members</Title>
        {state.user?.role === 'parent' && (
          <Button onClick={handleCreateChild}>Add Child Account</Button>
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
              <Button onClick={handleCreateChild}>Add Your First Child</Button>
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
