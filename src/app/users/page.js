'use client'
import {
  useUserStore
} from '@/store/useUserStore';
import { Button, Input, Spinner, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@heroui/react';
import { useEffect, useState } from 'react';

export default function NewPage() {
  const { user, createUserStore, updateUserStore, deleteUserStore, setUser } = useUserStore();
  const [isEditMode, setIsEditMode] = useState(false);
  const [datas, setDatas] = useState({
    id: 0,
    name: '',
    value: 0
  });
  const [loading, setLoading] = useState(false);
  const change = (n) => setDatas({
    ...datas,
    [n.target.name]: n.target.value
  });
  useEffect(() => {
    const data = async () => {
      try {
        const res = await fetch('/api/user');
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.message);
        }
        setUser(json);
      } catch (error) {
        throw new Error(error);
      }
    }
    data()
  }, [user]);

  const editUser = (data) => {
    console.log(data);
    setDatas({
      id: data.id,
      name: data.name,
      value: data.value
    });

  }
  const createUser = async (e) => {
    setLoading(true);
    e.preventDefault();
    try {
      if (isEditMode) {
        const res = await fetch(`/api/user/${datas.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(datas)
        });
        const json = await res.json();
        console.log(json);
        if (res.ok) {
          updateUserStore({
            id: json.id,
            name: json.name,
            value: json.value
          })
        }
      } else {
        const res = await fetch('/api/user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(datas)
        });
        const json = await res.json();
        console.log(json);
        if (res.ok) {
          createUserStore({
            id: json.id,
            name: json.name,
            value: json.value
          })
        }
      }
    } catch (error) {
      throw new Error(error);
    } finally {
      setDatas({
        id: 0,
        name: '',
        value: 0
      })
      setLoading(false)
      setIsEditMode(false)
    }
  }
  const deleteHandler = async (id) => {
    if (id === null || id === undefined) {
      throw new Error('id is null or undefined')
    }
    try {
      const res = await fetch(`/api/user/${id}`, { method: 'DELETE' });
      const json = await res.json();
      console.log(json);
      deleteUserStore(id);
    } catch (error) {
      console.error('Error, rolling back')
      setUser(user);
      throw new Error(error);
    }
  }
  return (
    <main className='flex flex-col justify-center items-center space-x-4'>
      <div>
        <h1>
          <Table>
            <TableHeader>
              <TableColumn>ID</TableColumn>
              <TableColumn>Name</TableColumn>
              <TableColumn>Value</TableColumn>
              <TableColumn>Action</TableColumn>
            </TableHeader>
            <TableBody emptyContent='No data found'>
              {user.map((data, i) => (
                <TableRow key={data.id}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell>{data.name}</TableCell>
                  <TableCell>{data.value}</TableCell>
                  <TableCell className='flex space-x-2'>
                    <Button onPress={() => { setIsEditMode(true), editUser(data) }} color='success'>Update</Button>
                    <Button onPress={() => deleteHandler(data.id)} color='warning'>Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </h1>
      </div>

      <div>
        <form onSubmit={createUser} className='flex flex-col space-y-4'>
          {
            loading ? <Spinner /> :
              <>
                <Input
                  type='text'
                  isRequired
                  label='name'
                  value={datas.name}
                  onChange={change}
                  name='name' />
                <Input
                  type='number'
                  isRequired
                  value={datas.value}
                  label='value'
                  onChange={change}
                  name='value' />
              </>}
          <Button disabled={loading} type='submit'>{
            isEditMode ? 'Update' : 'Create'
          }
          </Button>
          {
            isEditMode && <Button onPress={() => { setIsEditMode(false), setDatas({ id: 0, name: '', value: 0 }) }}>Cancel</Button>
          }
        </form>
      </div>
    </main>
  )
};