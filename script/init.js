

d3.csv("data/H-8Median_household_Income_2017adjusted.csv").then(incomedata => {
    //console.log(incomedata);
   
});

d3.csv("data/highest_marginal_income_taxrates.csv").then(incomedata => {
    console.log(incomedata);
   
});

//setup racial data sets 


async function loadRaceData(){
	let allRaces =  await d3.csv("data/h01AR.csv");

	let asiandata = await  d3.csv("data/h01A.csv");

	let blackdata = await  d3.csv("data/h01B.csv");

	let hispdata = await  d3.csv("data/h01H.csv");

	let whitedata = await  d3.csv("data/h01WNH.csv");

	let raceData = {
		overall : allRaces,
		asian : asiandata,
		black : blackdata,
		hispanic : hispdata,
		white : whitedata
	}

	
	//globalscope
	incomeTimePlot = new IncomeTimePlot(raceData);
	d3.selectAll('.sub-button').on('change', () => incomeTimePlot.updatePlot());
	d3.selectAll('.top-level-button').on('change', () => {
		let src = d3.event.originalTarget;
		d3.selectAll(`.${src.classList[1]}`)
			.nodes()
			.forEach((elem) => {
				elem.checked = src.checked;
			});
		incomeTimePlot.updatePlot();
	});
}

loadRaceData();

//TODO construct view