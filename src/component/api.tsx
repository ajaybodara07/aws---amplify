import React, { useEffect, useReducer, useState } from 'react'
import { Storage } from 'aws-amplify';
import { PhotoPicker, S3Album } from 'aws-amplify-react';
import API, { graphqlOperation } from '@aws-amplify/api'
import PubSub from '@aws-amplify/pubsub';
import { createTodo, updateTodo } from '../graphql/mutations'
import { listTodos } from '../graphql/queries'
import config from '../aws-exports'
import { onCreateTodo } from '../graphql/subscriptions'

// Configure Amplify
API.configure(config)             
PubSub.configure(config);

const initialState = {todos:[]};
const reducer = (state:any, action:any) =>{
  switch(action.type){
    case 'QUERY':
      return {...state, todos:action.todos}
    case 'SUBSCRIPTION':
      return {...state, todos:[...state.todos, action.todo]}
    default:
      return state
  }
}


  async function createNewTodo() {
    const todo = { name: Math.random().toString(36).substring(7), description: Math.random().toString(36).substring(7), location: Math.random().toString(36).substring(7) }
    console.log("todo data:", todo);
    return await API.graphql(graphqlOperation(createTodo, { input: todo }))
  }

  async function updateNewTodo() {
    const todo = { name: Math.random().toString(36).substring(7), description: Math.random().toString(36).substring(7), location: Math.random().toString(36).substring(7) }
    console.log("todo data:", todo);
    return await API.graphql(graphqlOperation(updateTodo, { input: todo }))
  }

  // async function deleteTodo() {
  //   const todo = { name: Math.random().toString(36).substring(7), description: Math.random().toString(36).substring(7), location: Math.random().toString(36).substring(7) }
  //   console.log("todo data:", todo);
  //   return await API.graphql(graphqlOperation(deleteTodo, { input: todo }))
  // }

  
  function App() {
    const [state, dispatch] = useReducer(reducer, initialState)
    const [Progress, setProgress] = useState(false)
    const [ImageList, setImageList] = useState([])

    useEffect(() => {
      //getData();
        let imgList: any = [];
        setProgress(true);
        Storage.list('')
          .then(result => {
            result.map((img: any) => {
              return Storage.get(img.key).then(imgUrl => {
                imgList.push(imgUrl);
                if (result.length === imgList.length) {
                  setImageList(imgList);
                  console.log("imgList:", imgList);
                  setProgress(false);
                }
              }).catch(err => console.log(err));
            });
          }).catch(err => console.log(err));
          const subscription = API.graphql(graphqlOperation(onCreateTodo)).subscribe({
            next: (eventData:any) => {
              const todo = eventData.value.data.onCreateTodo;
              dispatch({type:'SUBSCRIPTION', todo})
            }
        })
        return () => subscription.unsubscribe()
      }, []);


    async function getData() {
      const todoData = await API.graphql(graphqlOperation(listTodos))
      dispatch({type:'QUERY', todos: todoData.data.listRestaurantss.items});
    }

   const onChange=(e:any)=> {
      const file = e.target.files[0];
      Storage.put(file.name, file, {
          contentType: file.type
      })
      .then (result => console.log(result))
      .catch(err => console.log(err));
  }
  
    return (
      <div>
          <div className="app-header">
         <div className="app-logo">
             <img src="https://aws-amplify.github.io/images/Logos/Amplify-Logo-White.svg" alt="AWS Amplify" />
         </div>
         <h1>Welcome to the Amplify Framework</h1>
     </div>
      <div className="App">
      {/* <Link to="/singup"><button>Sign up</button></Link>
      <Link to="/singin"><button>Sign in</button></Link> */}
        <button onClick={createNewTodo}>Add Todo</button>
      </div>
      <div>{ state.todos.map((todo:any, i:any) => <div><p key={todo.id}>{todo.name} : {todo.description}</p><button onClick={updateNewTodo}>Update Data</button><button>Delete Data</button></div>) }</div>
    </div>
    );
  }

  export default App
