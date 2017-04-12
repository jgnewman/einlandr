module.exports = function (names) {
  return "import React from 'react';\n"
       + "import { Component } from 'react';\n"
       + "\n"
       + "class " + names.component + " extends Component {\n"
       + "  constructor() {\n"
       + "    super();\n"
       + "  }\n"
       + "\n"
       + "  render() {\n"
       + "    return (\n"
       + '      <div className="' + names.state + '">\n'
       + '        <h1>Hello, world!</h1>\n'
       + "      </div>\n"
       + "    );\n"
       + "  }\n"
       + "}\n"
       + "\n"
       + names.component + ".propTypes = {\n"
       + "  data: React.PropTypes.object.isRequired,\n"
       + "  actions: React.PropTypes.object.isRequired,\n"
       + "  handlers: React.PropTypes.object.isRequired\n"
       + "};\n"
       + "\n"
       + "export default " + names.component + ";\n"
       ;
}
