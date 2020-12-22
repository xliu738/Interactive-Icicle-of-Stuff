// create svg
const svg = d3.select('.canvas')
  .append('svg')
    .attr('width', 1200)
    .attr('height', 800);

// create context label
const context = d3.select('.context')
  .append('text')
  .attr('font-family', 'courier')
  .attr('font-size', '25px');

// grab control of the search form
const form = document.querySelector('#search-form');
const search = document.querySelector('.search-field #category');

// define stratify function
const strat = d3.stratify()
  .id(d => d.id)
  .parentId(d => d.parent);

// define partition function
const partitionLayout = d3.partition()
  .size([750, 1150]);

// define color function palettes based on colorBrewer
const color = d3.scaleOrdinal(d3.schemeAccent);

// define tooltip using d3-tip package
const tip = d3.tip()
  .attr('class', 'tip')
  .direction('e')
  .html(d => {
    return `<p>category: ${d.data.name}</p>
    <p>subcategories: ${d.value - 1}</p>
    <p>products: ${d.data.subtreeProductCount}</p>`;
  });
svg.call(tip);

// read in data; all other actions asynchronuous after data read
d3.csv("PetSupplies.csv").then((data, i, n) => {

  // stratify data for d3 use
  const rootNode = strat(data);

  // define the value to determine partition sizes
  rootNode.sum( (d) => {
    return 1;
  });

  // define the layout of the icicle plot
  const layout = partitionLayout(rootNode);
  const nodes = rootNode.descendants();
  const textsize = 8;
  const labelheight = 15;
  const labelwidth = (1150/(2/3*textsize)/rootNode.height);

  // define a textscaler function
  const textScaler = (d) => {
      return labelwidth/Math.max(labelwidth,(`${d.data.name}`.length));
  };

  // create data groups
  const bins = svg.selectAll('g')
    .data(nodes)
    .enter()
    .append('g')
      .attr('class', 'nodes')
      .attr('transform', d => `translate(${d.y0},${d.x0})`);

  // draw the data as rectangles with each group
  const rects = bins.append('rect')
    .attr('height', d => d.x1 - d.x0 - Math.min(1,(d.x1 - d.x0)/2))
    .attr('width', d => d.y1 - d.y0 - 1)
    .attr('fill', d => {
      if (!d.depth) return '#333';
      while (d.depth > 1) {
        d = d.parent;
      }
      return color(d.data.name);
    })
    .on('click', clicked)
    .on('mouseover', (d,i,n) => {
      tip.show(d, n[i]);
    })
    .on('mouseout', () => tip.hide());

  // draw the labels as data within each group
  const labels = bins.append('text')
    .attr('x', '5px')
    .attr('y', '10px')
    .attr('font-family', 'arial')
    .attr('font-size', d => textsize*(textScaler(d)) + 'px')
    .text(d => `${d.data.name}`)
    .attr('fill-opacity', d => +(((d.x1 - d.x0) > labelheight) && 
    (textsize*(textScaler(d)) <= labelwidth )));

  // handle click event interactions
  // initial focus on root node
  let focus = rootNode;
  let focustext = rootNode.data.name;
  context.text(focustext);
  function clicked(p) {

    // assign new focus to object clicked
    focus = (focus === p) ? p.parent : p;

    // force the focus to always be root node at least
    if (p.parent == null)
      focus = p;

    // logic to create the context string for users
    if (focus === rootNode) {
      focustext = rootNode.data.name; 
    } else if (!(focus === rootNode) && !(focus === p.parent)) {
      if (!focus.depth) return;
      let temp = focus;
      focustext = '';
      while (temp.depth > rootNode.depth) {
        focustext = temp.data.name + '>' + focustext;
        temp = temp.parent;
      }
      focustext = rootNode.data.name + '>' + focustext.substring(0, focustext.lastIndexOf('>'));
    } else if ((focus === p.parent)) {
      focustext = focustext.substring(0, focustext.lastIndexOf('>'));
    }
    context.text(focustext);

    // calculate the modifications to current visualization
    rootNode.each( d => {
      d._target = {
        y0: (d.y0 - focus.y0),
        y1: (d.y1 - focus.y0),
        x0: ((d.x0 - focus.x0)/(focus.x1 - focus.x0) * 750),
        x1: ((d.x1 - focus.x0)/(focus.x1 - focus.x0) * 750)
      }
    });

    // transition all of the DOM elements to new position
    bins.transition('move').duration(750)
      .attr('transform', d => `translate(${d._target.y0}, ${d._target.x0})`);

    rects.transition('zoom').duration(750)
      .attr('height', d => d._target.x1 - d._target.x0 - Math.min(1,(d._target.x1 - d._target.x0)/2))
      .attr('fill', d => {
        if (!d.depth) return '#333';
        while (d.depth-1 > focus.depth) {
          d = d.parent;
        }
        return color(d.data.name);
      });

    labels.attr('fill-opacity', d => +(((d._target.x1 - d._target.x0) > labelheight) &&
     (textsize*(textScaler(d)) <= labelwidth )));
  }

  // handle the search parameters
  let matchId = [];
  let currentQ = '';
  let query = '';
  form.addEventListener('submit', e => {
    e.preventDefault();

    query = search.value.toLowerCase();

    if (!currentQ.match(query)) {
      currentQ = query;
      matchId = [];
    }

    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].data.name.toLowerCase().match(query) && (matchId.indexOf(nodes[i].id) < 0)) {
        matchId.push(nodes[i].id);
        clicked(nodes[i]);
        return;
      }
    };

  });

});
