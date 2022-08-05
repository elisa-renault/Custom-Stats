/* © (Copyright) Booti386, 2022. All Rights Reserved. */

(() => {
'use strict';

function parse_BaseStatsData(root, filter_stat_param)
{
	let data = {};

	if (root === null || root === undefined)
		return data;

	if (filter_stat_param === null || filter_stat_param === undefined)
		filter_stat_param = () => true;

	let BaseStatsData = root.querySelectorAll(':scope > *');
	for (let v of BaseStatsData)
	{
		let data_entity = {};
		let entity_name = v.getAttribute('name');

		let BaseStatsPerClass = v.querySelectorAll(':scope > [name=BaseStatsPerClass] > *');
		for (let v of BaseStatsPerClass)
		{
			let data_class = {};
			let class_name = v.getAttribute('name');

			let BaseStats = v.querySelectorAll(':scope > [name=BaseStats] > *');
			for (let v of BaseStats)
			{
				let data_stats = {};
				let stat_name = v.querySelector(':scope > [name=BaseStatID]')
						.getAttribute('value');

				let BaseStatsValues = v.querySelectorAll(':scope > *');
				for (let v of BaseStatsValues)
				{
					let param_name = v.getAttribute('name');
					let param_value = v.getAttribute('value');

					if (!filter_stat_param(param_name, param_value))
						continue;

					data_stats[param_name] = param_value;
				}

				data_class[stat_name] = data_stats;
			}

			data_entity[class_name] = data_class;
		}

		data[entity_name] = data_entity;
	}

	return data;
}

/* Remove nodes that do not lead to values. */
function prune_tree(node)
{
	let keep = false;

	for (let k in node)
	{
		let sub = node[k];
		let sub_keep = false;

		if (typeof sub === 'object')
			sub_keep = prune_tree(sub);
		else
			sub_keep = true;

		if (!sub_keep)
			delete node[k];

		keep |= sub_keep;
	}

	return keep;
}

function cmp_cls(a, b)
{
	const ranks = {
		"S":  0,
		"A": -1,
		"B": -2,
		"C": -3
	};

	if (!ranks.hasOwnProperty(a))
		throw new Error(`Unknown ship class "${a}"`);
	if (!ranks.hasOwnProperty(b))
		throw new Error(`Unknown ship class "${b}"`);

	return ranks[a] - ranks[b];
}

function beautify(name)
{
	const map = {
		"ShipBaseStatsData": "",
		"WeaponBaseStatsData": "MT_",

		"ALIEN_SHIP": "Ship",
		"FREI_DAMAGE": "Dmg",
		"FREI_FLEET": "Fleet",
		"FREI_HYPERDRIVE": "HD",
		"SHIP_DAMAGE": "Dmg",
		"SHIP_FLEET": "Fleet",
		"SHIP_HYPERDRIVE": "HD",
		"SHIP_SHIELD": "Shield",

		"WEAPON_DAMAGE": "Dmg",
		"WEAPON_MINING": "Mining",
		"WEAPON_SCAN": "Scan",
	};

	if (!map.hasOwnProperty(name))
		return name;
	return map[name];
}

window.nms_gen_lua_from_xml = function(xml_txt)
{
	xml_txt = xml_txt.trim();
	if (xml_txt.startsWith('<?xml'))
		xml_txt = xml_txt.substring(xml_txt.indexOf('\n') + 1);

	if (xml_txt === '')
		return '-- No data --';

	let dom_parser = new DOMParser();
	let doc = dom_parser.parseFromString(xml_txt, 'application/xml');

	let root = doc.children[0];
	if (root.tagName === 'parsererror'
			&& root.namespaceURI === 'http://www.mozilla.org/newlayout/xml/parsererror.xml')
		throw new Error(root.querySelector('sourcetext').textContent);

	let data = {};

	let ShipBaseStatsData = root.querySelector(':scope > [name=ShipBaseStatsData]');
	let WeaponBaseStatsData = root.querySelector(':scope > [name=WeaponBaseStatsData]');

	let filter_stat_param = (name, value) => name.match(/^(Min|Max)$/) !== null;

	data['ShipBaseStatsData'] = parse_BaseStatsData(ShipBaseStatsData, filter_stat_param);
	data['WeaponBaseStatsData'] = parse_BaseStatsData(WeaponBaseStatsData, filter_stat_param);

	prune_tree(data);

	let out_defaults = '';
	let out_changes = '';

	out_changes = `-- Don't change code past this line unless you know what you are doing. --\n\nBaseStatChanges =\n{`;

	for (let category_name of Object.keys(data).sort())
	{
		let category = data[category_name];

		let header_line = `------ ${category_name.toUpperCase()} ------`;
		let header_decor = '-'.repeat(header_line.length);

		out_defaults += `${header_decor}\n${header_line}\n${header_decor}\n\n`;
		out_changes += `
  {
  "${category_name}",
    {`;

		for (let entity_name of Object.keys(category).sort())
		{
			let entity = category[entity_name];

			out_defaults += `--- ${entity_name.toUpperCase()} ---\n\n`;
			out_changes += `
      {
      "${entity_name}",
        {`;

			for (let cls_name of Object.keys(entity).sort(cmp_cls))
			{
				let cls = entity[cls_name];

				out_changes += `
          {
          "${cls_name}",
            {`;

				for (let stat_name of Object.keys(cls).sort())
				{
					let stats = cls[stat_name];

					out_changes += `
              {"${stat_name}",
                { `;

					for (let name of Object.keys(stats).sort())
					{
						let value = stats[name];

						let var_name = `${beautify(category_name)}${entity_name}${cls_name}_${beautify(stat_name)}_${name}`;

						out_defaults += `${var_name} = "${value}" -- "${value}"\n`;
						out_changes += `${var_name}, `;
					}

					out_changes += `}
              },`;
				}

				out_defaults += '\n';
				out_changes += `
            }
          },`;
			}

			out_changes += `
        }
      },`;
		}

		out_changes += `
    }
  },`;
	}

	out_changes += '\n}\n';

	return `${out_defaults}\n${out_changes}`;
}

})();
