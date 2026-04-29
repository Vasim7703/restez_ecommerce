'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, ThumbsUp, MoreVertical, Edit3 } from 'lucide-react'
import { Product } from '@/lib/supabase'
import { useAuthStore } from '@/lib/store'

export default function ProductReviews({ product }: { product: Product }) {
  const { user } = useAuthStore()
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [newReviewText, setNewReviewText] = useState('')
  const [newReviewRating, setNewReviewRating] = useState(5)
  
  // Create a local copy of reviews for immediate UI feedback when a user submits
  const [localReviews, setLocalReviews] = useState(product.reviews || [])

  const averageRating = localReviews.length > 0 
    ? localReviews.reduce((acc, r) => acc + r.rating, 0) / localReviews.length 
    : 0

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      alert("Please log in to write a review")
      return
    }
    if (!newReviewText.trim()) return

    const newReview = {
      id: String(Date.now()),
      user_name: user.name,
      rating: newReviewRating,
      comment: newReviewText,
      date: new Date().toISOString().split('T')[0],
      verified_purchase: true
    }

    setLocalReviews([newReview, ...localReviews])
    setNewReviewText('')
    setNewReviewRating(5)
    setShowReviewForm(false)
    // Note: In a real app, we would make an API call here to save it to Supabase
  }

  // Calculate rating distribution
  const distribution = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    count: localReviews.filter(r => r.rating === stars).length,
    percentage: localReviews.length > 0 
      ? (localReviews.filter(r => r.rating === stars).length / localReviews.length) * 100 
      : 0
  }))

  return (
    <div className="bg-white border-t border-gray-200" id="reviews">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-playfair font-bold text-charcoal mb-10 text-center">Customer Reviews</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Summary */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-gray-50 rounded-luxury p-8 flex flex-col items-center text-center">
              <p className="text-5xl font-playfair font-bold text-emerald mb-2">
                {averageRating.toFixed(1)}
              </p>
              <div className="flex items-center space-x-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-5 h-5 ${i < Math.round(averageRating) ? 'fill-gold text-gold' : 'fill-gray-300 text-gray-300'}`} 
                  />
                ))}
              </div>
              <p className="text-sm text-gray-500 font-montserrat">
                Based on {localReviews.length} {localReviews.length === 1 ? 'review' : 'reviews'}
              </p>
            </div>

            <div className="space-y-3 pl-2">
              {distribution.map(dist => (
                <div key={dist.stars} className="flex items-center space-x-3 text-sm font-montserrat text-gray-600">
                  <div className="flex items-center w-12 flex-shrink-0">
                    <span className="mr-1">{dist.stars}</span> 
                    <Star className="w-3 h-3 fill-gold text-gold" />
                  </div>
                  <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gold rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: `${dist.percentage}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-xs">{dist.count}</span>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-gray-100">
              <h3 className="font-montserrat font-bold text-charcoal mb-2">Share your thoughts</h3>
              <p className="text-sm text-gray-500 mb-4 line-clamp-2 gap-2">
                If you&apos;ve purchased this item, we&apos;d love to hear about your experience.
              </p>
              <button 
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="w-full flex items-center justify-center space-x-2 border-2 border-emerald text-emerald hover:bg-emerald hover:text-white px-4 py-3 rounded-luxury font-montserrat font-semibold transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                <span>Write a Review</span>
              </button>
            </div>
          </div>

          {/* Right Column: Reviews List & Form */}
          <div className="lg:col-span-8">
            <AnimatePresence>
              {showReviewForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: 32 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="bg-emerald/5 p-6 rounded-luxury border border-emerald/20 overflow-hidden"
                >
                  <h3 className="text-xl font-playfair font-bold text-emerald mb-4">Write a Review</h3>
                  {!user ? (
                    <div className="text-center py-6">
                      <p className="text-gray-600 font-montserrat mb-4">You need to be logged in to write a review.</p>
                      <a href="/auth/signin" className="px-6 py-2 bg-emerald text-white rounded-luxury font-montserrat font-semibold inline-block">
                        Sign In
                      </a>
                    </div>
                  ) : (
                    <form onSubmit={handleReviewSubmit}>
                      <div className="mb-4">
                        <label className="block text-sm font-montserrat font-semibold text-charcoal mb-2">Overall Rating *</label>
                        <div className="flex space-x-2">
                          {[1, 2, 3, 4, 5].map(star => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setNewReviewRating(star)}
                              className="focus:outline-none"
                            >
                              <Star className={`w-8 h-8 ${newReviewRating >= star ? 'fill-gold text-gold' : 'text-gray-300'}`} />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-montserrat font-semibold text-charcoal mb-2">Review *</label>
                        <textarea
                          rows={4}
                          value={newReviewText}
                          onChange={(e) => setNewReviewText(e.target.value)}
                          placeholder="What did you like or dislike? What should other shoppers know before buying?"
                          className="w-full px-4 py-3 border border-gray-300 rounded-luxury font-montserrat focus:ring-2 focus:ring-emerald outline-none resize-none"
                          required
                        />
                      </div>
                      <div className="flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={() => setShowReviewForm(false)}
                          className="px-6 py-2 text-gray-500 font-montserrat hover:bg-gray-100 rounded-luxury transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2 bg-gold hover:bg-gold-light text-white font-montserrat font-semibold rounded-luxury shadow-md transition-colors"
                        >
                          Submit Review
                        </button>
                      </div>
                    </form>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-8">
              {localReviews.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-luxury">
                  <p className="text-gray-500 font-montserrat">No reviews yet. Be the first to review this product!</p>
                </div>
              ) : (
                localReviews.map((review, i) => (
                  <div key={review.id} className={`${i !== localReviews.length - 1 ? 'border-b border-gray-100 pb-8' : ''}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-charcoal font-bold font-montserrat">
                          {review.user_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-montserrat font-semibold text-charcoal">{review.user_name}</p>
                          <div className="flex items-center space-x-2 mt-0.5">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-gold text-gold' : 'fill-gray-200 text-gray-200'}`} 
                                />
                              ))}
                            </div>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-400">{review.date}</span>
                          </div>
                        </div>
                      </div>
                      <button className="text-gray-400 hover:text-charcoal p-1">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                    
                    {review.verified_purchase && (
                      <p className="text-xs text-emerald font-montserrat font-semibold mb-3">
                        Verified Purchase
                      </p>
                    )}
                    
                    <p className="text-gray-700 font-montserrat text-sm leading-relaxed mb-4">
                      {review.comment}
                    </p>
                    
                    <button className="flex items-center space-x-1 text-xs text-gray-500 hover:text-emerald font-montserrat transition-colors">
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>Helpful</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
