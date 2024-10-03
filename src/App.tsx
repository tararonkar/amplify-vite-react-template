import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { Authenticator  } from "@aws-amplify/ui-react";
import { getCurrentUser, fetchUserAttributes, signOut  } from 'aws-amplify/auth';

const client = generateClient<Schema>();

function App() {
  const [devices, setDevices] = useState<Array<Schema["Device"]["type"]>>([]);
    const [currentUser, setCurrentUser] = useState<Schema["User"]["type"] | null>(null)
  useEffect(() => {
    client.models.Device.observeQuery().subscribe({
      next: (data) => setDevices([...data.items]),
    });
  }, []);

  function createDevice() {
    client.models.Device.create({
        identifier: "DDEV" + Date.now(),
        userId: currentUser?.id,
    });
  }

  const addUser = async () => {
    const { userId } = await getCurrentUser()
    const { preferred_username, email  } = await fetchUserAttributes()

    const users = await client.models.User.list({
        filter: {
            user_id: {
                eq: userId
            }
        }
    })

    if(users.data.length > 0)
    {
        const u: Schema['User']["type"] = users.data[0];
        setCurrentUser(u);
    }
    else{
        const u = await client.models.User.create({
            id: null,
            user_id: userId,
            name: preferred_username ?? "",
            email: email ?? ""
        })

        if(u.data){
            setCurrentUser(u.data)
            console.log(u.data);
        }
    }
    
  }

  return (
    <Authenticator>
        <main>
        <h1>My todos <button onClick={addUser}>Add user</button> <button onClick={() => signOut()}>Logout</button></h1>
        <button onClick={createDevice}>Add Device</button>
        <ul>
            { devices.map((d) => <li>{d.identifier}</li>)}
        </ul>
        <div>
            🥳 App successfully hosted. Try creating a new todo.
            <br />
            <a href="https://docs.amplify.aws/react/start/quickstart/#make-frontend-updates">
            Review next step of this tutorial.
            </a>
        </div>
        </main>
    </Authenticator>
  );
}

export default App;
