'use client'
import 'bulma/css/bulma.min.css';
import { Block, Box, Button, Columns, Form, Icon, Notification } from "react-bulma-components";
import { useState } from 'react';
import Randomizer from './randomizer';
import './component.css'

export default function Home() {

  const [selectedSet, setSelectedState] = useState<string[]>([])

  const toogleSet = (toogledSet: string) => {
    if (selectedSet.includes(toogledSet)) {
      setSelectedState(selectedSet.filter(set => set != toogledSet))
    } else {
      setSelectedState(selectedSet.concat([toogledSet]))
    }
  }

  return <Box style={{height: "100vh"}}><Randomizer></Randomizer></Box>

  return (
    <Box>
      <Columns>
        <Columns.Column size={3}>
          <form>
            {all_cards.map(set => <Form.Field key={set.name}>
              <div className='control'>
                <label className="checkbox">
                  <input type="checkbox" checked={selectedSet.includes(set.name)} onChange={() => toogleSet(set.name)}/>
                  <span className="pl-1">{set.name}</span>
                </label>
              </div>
              </Form.Field>
            )}
          </form>
        </Columns.Column>
        <Columns.Column>
          <Notification color="primary">Second Column</Notification>
        </Columns.Column>
      </Columns>
    </Box>
  );
}
