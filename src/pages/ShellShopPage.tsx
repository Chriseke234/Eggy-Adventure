import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  ShoppingBag, 
  ChevronLeft, 
  Check, 
  Lock,
  Sparkles,
  Zap,
  Info
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import EggAvatar from '../components/EggAvatar'
import type { AvatarConfig } from '../components/EggAvatar'
import { audio } from '../lib/audio'

interface ShopItem {
  id: string
  name: string
  price: number
  type: 'outfit' | 'accessory' | 'expression'
  value: string
  rarity: 'Common' | 'Rare' | 'Legendary'
  description: string
}

const SHOP_ITEMS: ShopItem[] = [
  // Outfits
  { id: 'cape_01', name: 'Ankara Cape', price: 50, type: 'outfit', value: 'ankara_cape', rarity: 'Common', description: 'A stylish cape made from local textiles.' },
  { id: 'hero_01', name: 'Super Hero Suit', price: 200, type: 'outfit', value: 'super_hero', rarity: 'Legendary', description: 'For eggs that save the day!' },
  
  // Accessories
  { id: 'shades_01', name: 'Cool Shades', price: 30, type: 'accessory', value: 'cool_shades', rarity: 'Common', description: 'Stay cool in the Lagos sun.' },
  { id: 'mono_01', name: 'Golden Monocle', price: 100, type: 'accessory', value: 'monocle', rarity: 'Rare', description: 'For the most sophisticated explorers.' },
  { id: 'helm_01', name: 'Space Helmet', price: 300, type: 'accessory', value: 'space_helmet', rarity: 'Legendary', description: 'Hatch missions beyond the stars!' },
  
  // Expressions
  { id: 'expr_01', name: 'Surprised!', price: 20, type: 'expression', value: 'surprised', rarity: 'Common', description: 'Oh wow! An expression of wonder.' },
]

const ShellShopPage: React.FC = () => {
  const { profile, updateProfile } = useAuth()
  const navigate = useNavigate()
  const [inventory, setInventory] = useState<string[]>([])
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null)
  const [previewConfig, setPreviewConfig] = useState<AvatarConfig>(profile?.avatar_config || {
    shellColor: '#2A9D8F',
    outfit: 'none',
    accessory: 'none',
    expression: 'happy'
  })

  // Shells economy: 10 XP = 1 Shell
  const shells = Math.floor((profile?.xp || 0) / 10)
  const spentShells = parseInt(localStorage.getItem('eggy_spent_shells') || '0')
  const balance = shells - spentShells

  useEffect(() => {
    const savedInventory = JSON.parse(localStorage.getItem('eggy_inventory') || '["none"]')
    setInventory(savedInventory)
  }, [])

  const handlePreview = (item: ShopItem) => {
    audio.playClick()
    setSelectedItem(item)
    setPreviewConfig(prev => ({
      ...prev,
      [item.type]: item.value
    }))
  }

  const handlePurchase = async () => {
    if (!selectedItem || balance < selectedItem.price) return

    audio.playSuccess()
    const newSpent = spentShells + selectedItem.price
    const newInventory = [...inventory, selectedItem.id]
    
    localStorage.setItem('eggy_spent_shells', newSpent.toString())
    localStorage.setItem('eggy_inventory', JSON.stringify(newInventory))
    setInventory(newInventory)
    
    // Save the new config to profile
    if (updateProfile) {
       await updateProfile({
          avatar_config: previewConfig
       })
    }

    setSelectedItem(null)
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Mini Header */}
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => navigate(-1)} className="p-2 bg-white/5 rounded-xl border border-white/5">
           <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <div className="flex items-center gap-3 bg-navy/80 border border-gold/30 px-4 py-2 rounded-2xl shadow-[0_0_15px_rgba(233,196,106,0.2)]">
           <div className="w-8 h-8 bg-gold/20 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-gold" />
           </div>
           <div className="flex flex-col">
              <span className="text-[10px] font-black text-gold uppercase leading-none">Your Balance</span>
              <span className="font-fredoka text-xl text-white">{balance} <span className="text-xs">Shells</span></span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Preview Section */}
        <div className="space-y-6">
           <div className="card bg-gradient-to-b from-navy-light to-navy p-8 text-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <EggAvatar config={previewConfig} xp={profile?.xp} scale={1.2} />
              <div className="mt-8 space-y-2">
                 <h2 className="text-2xl font-fredoka text-white">Style Preview</h2>
                 <p className="text-sm text-gray-400">Try on new items before you buy!</p>
              </div>
           </div>

           {selectedItem && (
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="card border-gold/50 bg-gold/5 p-6 space-y-4"
             >
                <div className="flex justify-between items-start">
                   <div>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                        selectedItem.rarity === 'Legendary' ? 'bg-orange text-white' : 
                        selectedItem.rarity === 'Rare' ? 'bg-teal text-white' : 'bg-gray-500 text-white'
                      }`}>
                        {selectedItem.rarity}
                      </span>
                      <h3 className="text-xl font-fredoka text-white mt-1">{selectedItem.name}</h3>
                   </div>
                   <div className="text-xl font-fredoka text-gold">{selectedItem.price} 🐚</div>
                </div>
                <p className="text-sm text-gray-300">{selectedItem.description}</p>
                <button 
                  onClick={handlePurchase}
                  disabled={balance < selectedItem.price || inventory.includes(selectedItem.id)}
                  className="btn-primary w-full py-4 flex items-center justify-center gap-2 disabled:bg-gray-700 disabled:border-none"
                >
                   {inventory.includes(selectedItem.id) ? (
                     <><Check className="w-5 h-5" /> Already Owned</>
                   ) : balance >= selectedItem.price ? (
                     <><ShoppingBag className="w-5 h-5" /> Purchase Item</>
                   ) : (
                     <><Lock className="w-5 h-5" /> Not Enough Shells</>
                   )}
                </button>
             </motion.div>
           )}
        </div>

        {/* Shop Items Grid */}
        <div className="space-y-6">
           <div className="flex items-center gap-2 mb-4">
              <ShoppingBag className="w-5 h-5 text-teal" />
              <h3 className="text-xl font-fredoka text-white">The Egg-porium</h3>
           </div>

           <div className="grid grid-cols-2 gap-4">
              {SHOP_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handlePreview(item)}
                  className={`card p-4 text-left border-2 transition-all group ${
                    selectedItem?.id === item.id ? 'border-gold bg-gold/5' : 'border-white/5 hover:border-white/20'
                  }`}
                >
                   <div className="flex justify-between mb-3 text-[10px] font-black uppercase tracking-tighter">
                      <span className={item.rarity === 'Legendary' ? 'text-orange' : item.rarity === 'Rare' ? 'text-teal' : 'text-gray-500'}>
                         {item.rarity}
                      </span>
                      {inventory.includes(item.id) && <Check className="w-3 h-3 text-teal" />}
                   </div>
                   <div className="aspect-square bg-navy/50 rounded-2xl mb-3 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                      {item.value === 'ankara_cape' ? '🧣' : 
                       item.value === 'super_hero' ? '🦸' : 
                       item.value === 'cool_shades' ? '🕶️' : 
                       item.value === 'monocle' ? '🧐' : 
                       item.value === 'space_helmet' ? '👨‍🚀' : '😮'}
                   </div>
                   <p className="font-bold text-xs text-white mb-1">{item.name}</p>
                   <div className="flex items-center gap-1 text-gold font-fredoka text-sm">
                      <Zap className="w-3 h-3 fill-gold" />
                      {item.price}
                   </div>
                </button>
              ))}
           </div>

           <div className="bg-navy-light/50 rounded-2xl p-4 flex gap-3 text-xs text-gray-400 border border-white/5">
              <Info className="w-4 h-4 text-teal shrink-0" />
              <p>Earn shells by completing missions. 10 XP = 1 Shell! Buy cool items to level up your style.</p>
           </div>
        </div>
      </div>
    </div>
  )
}

export default ShellShopPage
