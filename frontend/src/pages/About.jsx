import React from 'react'
import Layout from '../components/Layout'

function About() {
  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-semibold text-ink mb-6">About TaxCurb</h1>
          <div className="space-y-8 text-slate-700 leading-relaxed text-lg">
            <p>
              TaxCurb is a tax filing platform designed specifically for F-1 international students studying in the United States. 
              We understand the unique challenges that non-resident aliens face when navigating the U.S. tax system.
            </p>
            <p>
              Our mission is to make tax filing simple, accurate, and accessible for international students. We guide you through 
              the process of filing the correct forms, including 1040-NR and 8843, ensuring compliance with IRS regulations while 
              maximizing your tax benefits.
            </p>
            <p>
              TaxCurb is built with transparency, affordability, and compliance in mind. We believe that filing your taxes shouldn't 
              be complicated or expensive, especially for students who are already managing the challenges of studying abroad.
            </p>
          </div>
        </div>
    </div>
    </Layout>
  )
}

export default About

