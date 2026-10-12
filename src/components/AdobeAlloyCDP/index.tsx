import Script from 'next/script'

const AdobeAlloyCDP = () => {
  return (
    <>
      {/* Initialize Alloy namespace */}
      <Script id='adobe-alloy-init' strategy='afterInteractive'>
        {`
          !function(n,o){
            o.forEach(function(o){
              n[o] || (
                (n.__alloyNS=n.__alloyNS||[]).push(o),
                n[o]=function(){
                  var u=arguments;
                  return new Promise(function(i,l){
                    n[o].q.push([i,l,u])
                  })
                },
                n[o].q=[]
              )
            })
          }(window,["alloy"]);
        `}
      </Script>
      
      {/* Load Alloy SDK */}
      <Script
        id='adobe-alloy'
        src='https://cdn1.adoberesources.net/alloy/2.27.0/alloy.min.js'
        strategy='afterInteractive'
        async
      />
    </>
  )
}

export default AdobeAlloyCDP

