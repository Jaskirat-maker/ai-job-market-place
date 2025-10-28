const Header = ({title}) =>
{
  // there there is a usage of the props and the title

  return (
    <div>
    <header  style = {{ 
      backgroundColor : 'grey',
      color : 'white',
      textAlign : 'center',
      padding : '10px'
      
    }} 
    >
  <h1> {title} </h1>

    </header>
    </div>
  )
}
export default Header;