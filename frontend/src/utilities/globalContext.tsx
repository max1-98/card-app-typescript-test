import {createContext , useState, FC, ReactNode, useEffect} from 'react'
import {Entry, EntryContextType, BetweenDates} from '../@types/context'
import axios from 'axios'

export const EntryContext = createContext<EntryContextType | null>(null);

export const EntryProvider: React.FC<{children : ReactNode}> = ({children}) => {
    const [entries, setEntries] = useState<Entry[]>([]);

    const initState = async () => {
        const data = await axios.get<Entry[]>('http://localhost:3001/get/')
        const initialStateBody = data.data
        setEntries(initialStateBody)
    }

    useEffect(() => {
        initState()
      }, []);

    const saveEntry = async (entry: Entry) => {
        const requestData = await axios.post<Entry>('http://localhost:3001/create/', entry)
        const newEntry = requestData.data
        setEntries([...entries, newEntry])
      }

    const updateEntry = async (id: string, entry: Entry) => {
        await axios.put<Entry>(`http://localhost:3001/update/${id}/`, entry)
        setEntries(entries => {
          const entryIndex = entries.findIndex((obj => obj.id == id))
          entries[entryIndex] = entry
          return entries
        })
    }
    const deleteEntry = async (id: string) => {
        await axios.delete<Entry>(`http://localhost:3001/delete/${id}/`)
        setEntries(e => e.filter(entry => entry.id != id))
    }

    const betweenEntry = async (betweendate: BetweenDates) => {
      
      const data = await axios.get<Entry[]>(`http://localhost:3001/get_between/${betweendate.start_date}/${betweendate.end_date}/`)
      setEntries(data.data);
      
    }

    return (
        <EntryContext.Provider value={{ entries, saveEntry, updateEntry, deleteEntry, betweenEntry}}>
          {children}
        </EntryContext.Provider>
      )
}

