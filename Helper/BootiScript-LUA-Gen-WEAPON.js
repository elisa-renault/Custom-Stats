function nms_gen_lua_from_xml(xml_txt)
{
	'use strict';

	xml_txt.trim();
	if (xml_txt.startsWith('<?xml'))
		xml_txt = xml_txt.substring(xml_txt.indexOf('\n') + 1);

	let dom_parser = new DOMParser();
	let doc = dom_parser.parseFromString(xml_txt, 'application/xml');

	let root_e = doc.children[0];
	if (root_e.tagName === 'parsererror' && root_e.namespaceURI === 'http://www.mozilla.org/newlayout/xml/parsererror.xml')
		throw new Error(root_e.querySelector('sourcetext').textContent);

	let data = {};

	let WeaponBaseStatsData = doc.querySelectorAll(':root>[name=WeaponBaseStatsData]>*');
	for (let v of WeaponBaseStatsData)
	{
		let data_weapon = {};
		let weapon_name = v.getAttribute('name');

		let BaseStatsPerClass = v.querySelectorAll('[name=BaseStatsPerClass]>*');
		for (let v of BaseStatsPerClass)
		{
			let data_class = {};
			let class_name = v.getAttribute('name');

			let BaseStats = v.querySelectorAll('[name=BaseStats]>*');
			for (let v of BaseStats)
			{
				let data_stats = {};
				let stat_name = v.querySelector('[name=BaseStatID]')
						.getAttribute('value');

				let BaseStatsValues = v.querySelectorAll('*');
				for (let v of BaseStatsValues)
				{
					let name = v.getAttribute('name');
					let value = v.getAttribute('value');

					data_stats[name] = value;
				}

				data_class[stat_name] = data_stats;
			}

			data_weapon[class_name] = data_class;
		}

		data[weapon_name] = data_weapon;
	}

	let out_defaults = '';
	let out_array = '';

	out_array += 'BaseStatChanges =\n{';

	let beautify = (name) => {
		const map = {
			"WEAPON_DAMAGE": "Dmg",
			"WEAPON_MINING": "Mining",
			"WEAPON_SCAN": "Scan",
		};

		if (!map.hasOwnProperty(name))
			return name;
		return map[name];
	};

	for (let weapon_name in data)
	{
		let weapon = data[weapon_name];

		out_array += `
  {
  "${weapon_name}",
    {`;

		for (let class_name in weapon)
		{
			let cls = weapon[class_name];

			out_array += `
      {
      "${class_name}",
        {`;

			for (let stat_name in cls)
			{
				let stats = cls[stat_name];

				out_array += `
          {"${stat_name}",
            { `;

				for (let name in stats)
				{
					let value = stats[name];

					if (name.match(/^(Min|Max)$/) === null)
						continue;

					let var_name = `${weapon_name}${class_name}_${beautify(stat_name)}_${name}`;

					out_defaults += `${var_name} = "${value}" -- "${value}"\n`;
					out_array += `${var_name}, `;
				}

				out_array += `}
          },`;
			}

			out_array += `
        }
      },`;
		}

			out_array += `
    }
  },`;
	}

	out_array += '\n}\n';

	return `${out_defaults}\n${out_array}`;
}
