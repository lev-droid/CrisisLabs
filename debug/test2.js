

function test() 
{
	fetch("http://localhost:4000")
		.then((response) => {
			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`);
			}

			return response.blob();
		})
		.then((response) => {
			console.log(response);
		});
}