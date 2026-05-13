'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Save, Plus, Trash2, LayoutDashboard } from 'lucide-react'

export default function CMSPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [uploading, setUploading] = useState(false)

  const [interval, setIntervalTime] = useState(5000)
  const [slides, setSlides] = useState<any[]>([])
  const [videos, setVideos] = useState<any[]>([])
  const [contact, setContact] = useState({ email: '', phone: '', address: '', whatsapp: '' })
  const [about, setAbout] = useState({ heading: '', content: '', image: '' })

  const [activeTab, setActiveTab] = useState<'homepage' | 'videos' | 'contact' | 'about'>('homepage')

  useEffect(() => {
    fetchCMS()
  }, [])

  const fetchCMS = async () => {
    try {
      const [carouselRes, videoRes, contactRes, aboutRes] = await Promise.all([
        fetch('/api/cms?key=homepage_carousel'),
        fetch('/api/cms?key=video_gallery'),
        fetch('/api/cms?key=contact_details'),
        fetch('/api/cms?key=about_page')
      ])

      const carouselData = await carouselRes.json()
      if (carouselRes.ok && carouselData.data) {
        setIntervalTime(carouselData.data.interval || 5000)
        setSlides(carouselData.data.slides || [])
      }

      const videoData = await videoRes.json()
      if (videoRes.ok && videoData.data) {
        setVideos(videoData.data.videos || [])
      }

      const contactData = await contactRes.json()
      if (contactRes.ok && contactData.data) {
        setContact(contactData.data)
      }

      const aboutData = await aboutRes.json()
      if (aboutRes.ok && aboutData.data) {
        setAbout(aboutData.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const responses = await Promise.all([
        fetch('/api/cms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'homepage_carousel', data: { interval, slides } })
        }),
        fetch('/api/cms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'video_gallery', data: { videos } })
        }),
        fetch('/api/cms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'contact_details', data: contact })
        }),
        fetch('/api/cms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'about_page', data: about })
        })
      ])
      
      if (responses.some(res => !res.ok)) throw new Error('Failed to save some CMS config')
      
      setSuccess('CMS updated successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const addSlide = () => {
    setSlides([...slides, { title: '', subtitle: '', image: '', cta: 'Shop Now', link: '/products' }])
  }

  const removeSlide = (index: number) => {
    setSlides(slides.filter((_, i) => i !== index))
  }

  const updateSlide = (index: number, field: string, value: string) => {
    const newSlides = [...slides]
    newSlides[index] = { ...newSlides[index], [field]: value }
    setSlides(newSlides)
  }

  const addVideo = () => {
    setVideos([...videos, { title: '', url: '', thumbnail: '' }])
  }

  const removeVideo = (index: number) => {
    setVideos(videos.filter((_, i) => i !== index))
  }

  const updateVideo = (index: number, field: string, value: string) => {
    const newVideos = [...videos]
    newVideos[index] = { ...newVideos[index], [field]: value }
    setVideos(newVideos)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number, type: 'slide' | 'fabric') => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Upload failed')

      if (type === 'slide') {
        updateSlide(index, 'image', data.url)
      } else if (type === 'video_thumbnail') {
        updateVideo(index, 'thumbnail', data.url)
      } else if (type === 'about') {
        setAbout({ ...about, image: data.url })
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  if (loading) return <div className="p-8 text-center text-gray-500">Loading CMS...</div>

  return (
    <div className="p-8 pb-32">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-playfair font-bold text-charcoal">Site Content</h1>
          <p className="text-gray-500 font-montserrat mt-1">Manage dynamic content across the storefront</p>
        </div>
      </div>

      <div className="flex space-x-4 mb-8 border-b border-gray-200">
        {(['homepage', 'videos', 'contact', 'about'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 px-2 font-montserrat font-bold capitalize transition-colors border-b-2 ${
              activeTab === tab ? 'border-emerald text-emerald' : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Floating Save Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <button
          onClick={handleSave}
          disabled={saving || uploading}
          className="flex items-center space-x-3 bg-emerald hover:bg-emerald-light text-white px-8 py-4 rounded-full font-montserrat font-bold transition-all disabled:opacity-50 shadow-[0_10px_40px_-10px_rgba(26,107,74,0.6)] hover:-translate-y-1"
        >
          <Save className="w-6 h-6" />
          <span>{saving ? 'Saving...' : 'Save All Changes'}</span>
        </button>
      </div>

      {error && <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-luxury border border-red-100">{error}</div>}
      {success && <div className="mb-4 p-4 bg-emerald/10 text-emerald rounded-luxury border border-emerald/20 font-semibold">{success}</div>}

      {activeTab === 'homepage' && (
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8">
          <h2 className="text-2xl font-playfair font-bold mb-8 text-charcoal">Homepage Carousel</h2>
          
          <div className="mb-10 bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Slide Timer (Milliseconds)</label>
            <input
              type="number"
              value={interval}
              onChange={e => setIntervalTime(parseInt(e.target.value) || 5000)}
              className="w-48 px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald outline-none font-montserrat shadow-sm"
            />
            <p className="text-xs text-gray-500 mt-2">Example: 5000 = 5 seconds</p>
          </div>

          <div className="space-y-6">
            {slides.map((slide, i) => (
              <div key={i} className="flex flex-col space-y-6 p-8 bg-gray-50 border border-gray-200 rounded-[2rem] relative transition-all hover:shadow-md">
                <div className="flex justify-between items-center border-b border-gray-200 pb-4">
                  <h3 className="text-lg font-playfair font-bold text-emerald">Slide {i + 1}</h3>
                  <button onClick={() => removeSlide(i)} className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                    <input type="text" value={slide.title} onChange={e => updateSlide(i, 'title', e.target.value)} placeholder="Royal Heritage Collection" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-montserrat shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Subtitle</label>
                    <input type="text" value={slide.subtitle} onChange={e => updateSlide(i, 'subtitle', e.target.value)} placeholder="Timeless Elegance Meets Modern Comfort" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-montserrat shadow-sm" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Image</label>
                    <div className="flex items-center space-x-4">
                      <input type="text" value={slide.image} onChange={e => updateSlide(i, 'image', e.target.value)} placeholder="/sofas/sofa_emerald_velvet.png" className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl font-montserrat shadow-sm" />
                      <label className="cursor-pointer bg-emerald/10 text-emerald hover:bg-emerald hover:text-white px-6 py-3 rounded-xl font-semibold transition-colors whitespace-nowrap">
                        {uploading ? '...' : 'Upload'}
                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, i, 'slide' as any)} className="hidden" />
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Button Text</label>
                    <input type="text" value={slide.cta} onChange={e => updateSlide(i, 'cta', e.target.value)} placeholder="Explore Collection" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-montserrat shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Button Link URL</label>
                    <input type="text" value={slide.link} onChange={e => updateSlide(i, 'link', e.target.value)} placeholder="/products" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-montserrat shadow-sm" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={addSlide}
            className="mt-8 flex items-center justify-center space-x-2 w-full py-4 border-2 border-dashed border-emerald/50 text-emerald hover:bg-emerald/5 rounded-[2rem] font-montserrat font-semibold transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add New Slide</span>
          </button>
        </div>
      )}

      {activeTab === 'videos' && (
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8">
          <h2 className="text-2xl font-playfair font-bold mb-8 text-charcoal">Video Gallery</h2>
          
          <div className="space-y-6">
            {videos.map((video, i) => (
              <div key={i} className="flex flex-col space-y-6 p-8 bg-gray-50 border border-gray-200 rounded-[2rem] relative transition-all hover:shadow-md">
                <div className="flex justify-between items-center border-b border-gray-200 pb-4">
                  <h3 className="text-lg font-playfair font-bold text-emerald">Video {i + 1}</h3>
                  <button onClick={() => removeVideo(i)} className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                    <input type="text" value={video.title} onChange={e => updateVideo(i, 'title', e.target.value)} placeholder="Video Title" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-montserrat shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">YouTube URL</label>
                    <input type="text" value={video.url} onChange={e => updateVideo(i, 'url', e.target.value)} placeholder="https://youtube.com/..." className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-montserrat shadow-sm" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Thumbnail Image (Optional)</label>
                    <div className="flex items-center space-x-4">
                      <input type="text" value={video.thumbnail} onChange={e => updateVideo(i, 'thumbnail', e.target.value)} placeholder="/images/thumb.png" className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl font-montserrat shadow-sm" />
                      <label className="cursor-pointer bg-emerald/10 text-emerald hover:bg-emerald hover:text-white px-6 py-3 rounded-xl font-semibold transition-colors whitespace-nowrap">
                        {uploading ? '...' : 'Upload'}
                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, i, 'video_thumbnail' as any)} className="hidden" />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={addVideo}
            className="mt-8 flex items-center justify-center space-x-2 w-full py-4 border-2 border-dashed border-emerald/50 text-emerald hover:bg-emerald/5 rounded-[2rem] font-montserrat font-semibold transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add New Video</span>
          </button>
        </div>
      )}

      {activeTab === 'contact' && (
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8">
          <h2 className="text-2xl font-playfair font-bold mb-8 text-charcoal">Contact Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <input type="email" value={contact.email} onChange={e => setContact({...contact, email: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-montserrat shadow-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
              <input type="text" value={contact.phone} onChange={e => setContact({...contact, phone: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-montserrat shadow-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">WhatsApp Number (with country code)</label>
              <input type="text" value={contact.whatsapp} onChange={e => setContact({...contact, whatsapp: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-montserrat shadow-sm" />
              <p className="text-xs text-gray-500 mt-1">Example: +919876543210 (Used for "Send Query")</p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Physical Address</label>
              <textarea value={contact.address} onChange={e => setContact({...contact, address: e.target.value})} rows={3} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-montserrat shadow-sm resize-none" />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'about' && (
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8">
          <h2 className="text-2xl font-playfair font-bold mb-8 text-charcoal">About Page Content</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Heading</label>
              <input type="text" value={about.heading} onChange={e => setAbout({...about, heading: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-montserrat shadow-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Main Content</label>
              <textarea value={about.content} onChange={e => setAbout({...about, content: e.target.value})} rows={10} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-montserrat shadow-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Featured Image</label>
              <div className="flex items-center space-x-4">
                <input type="text" value={about.image} onChange={e => setAbout({...about, image: e.target.value})} className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl font-montserrat shadow-sm" />
                <label className="cursor-pointer bg-emerald/10 text-emerald hover:bg-emerald hover:text-white px-6 py-3 rounded-xl font-semibold transition-colors whitespace-nowrap">
                  {uploading ? '...' : 'Upload'}
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 0, 'about' as any)} className="hidden" />
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
