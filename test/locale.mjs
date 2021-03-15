import tap from 'tap'

import { readdir as readDirCallback, readFile as readFileCallback } from "fs"
import { join } from "path"
import { promisify } from "util"

import { LOCALE_KEYS } from "../src/integrations/index.mjs"

const readDir = promisify( readDirCallback )
const readFile = promisify( readFileCallback )

const required_props = [
  "extension_name",
  "extension_description",
  "sidebar_name",
]

tap.test( async function validateLocales( t ) {
  const locales_path = "./src/assets/_locales"
  const locales_keys = await readDir( locales_path )

  for( const locale_key of locales_keys ) {
    const locale_file = await readFile( join( locales_path, locale_key, "messages.json" ), { encoding: "UTF8" } )
    const locale = JSON.parse( locale_file )

    const locale_props = Object.keys( locale )

    const missing_required_props = required_props.filter( ( prop ) => ! locale_props.includes( prop ) )
    t.equal( missing_required_props.length, 0, `Locale "${ locale_key }" doesn't include required keys ${ missing_required_props.join( ", " ) }` )

    const missing_shared_props = LOCALE_KEYS.filter( ( prop ) => ! locale_props.includes( prop ) )
    t.equal( missing_shared_props.length, 0, `Locale "${ locale_key }" doesn't include keys ${ missing_shared_props.map( prop => `"${ prop }"`).join( ", " ) }` )

    const extra_shared_props = locale_props.filter( ( prop ) => ! LOCALE_KEYS.includes( prop ) )
    t.equal( extra_shared_props.length, 0, `Locale "${ locale_key }" includes extra keys ${ extra_shared_props.map( prop => `"${ prop }"`).join( ", " ) }` )

    const empty_message_keys = locale_props.filter( ( prop ) => ! locale[ prop ].message )
    t.equal( empty_message_keys.length, 0, `Locale "${ locale_key }" includes empty keys ${ empty_message_keys.map( prop => `"${ prop }"`).join( ", " ) }` )
  }

})
